import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { SDJwtInstance } from '@sd-jwt/core';
import createSignerVerifier, {
  digest,
  ES256,
  generateSalt,
} from '../lib/utils';
import PolyfillCrypto from 'react-native-webview-crypto';
import { Stack } from 'expo-router';

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '50%',
    aspectRatio: 1,
    borderWidth: 1,
    margin: 10,
    position: 'relative',
  },
  claimsText: {
    position: 'absolute',
    top: '15%',
    left: '15%',
  },
  largeButtonText: {
    fontSize: 20,
  },
  camera: {
    flex: 1,
  },
});

export default function Index() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState<boolean>(false);
  const [vc, setVc] = useState<any>(null);
  const [claims, setClaims] = useState<any>(null);

  const checkPermissionAndScan = () => {
    if (cameraPermission?.granted) {
      setScanned((scanned) => !scanned);
    } else {
      requestCameraPermission();
    }
  };

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    try {
      setScanned(true);

      // Parse the scanned JSON and extract the JWT
      const parsed = JSON.parse(data);
      const jwtToken = parsed.proof?.jwt;

      // Verify the JWT signature
      const { claims, disclosures } = await verifyJwtSignature(jwtToken);

      console.log('Verified VC:', disclosures);

      // Show the VC data
      setClaims(claims);

      // Store and display the credential
      await storeCredential(disclosures);
    } catch (error: any) {
      console.error('Error parsing VC:', error);

      Alert.alert('Invalid VC', 'The VC signature is invalid');
    }
  };

  const verifyJwtSignature = async (jwt: string) => {
    const { signer, verifier } = await createSignerVerifier();

    const sdjwt = new SDJwtInstance({
      // SD-JWT
      signer, // sign (ECDSA-P256)
      signAlg: ES256.alg,
      verifier, // verify

      // Claim hashing
      hasher: digest,
      saltGenerator: generateSalt,

      // Holder-binding (Key-Binding) JWT
      kbSigner: signer, // sign (EdDSA-Ed25519)
      kbSignAlg: 'EdDSA',
      kbVerifier: verifier, // verify
    });

    // Decode the JWT to verify its signature
    const decodedObject = await sdjwt.decode(jwt);
    console.log('DecodedObject:', decodedObject);

    // Find disclosures in the decoded object
    const disclosures = decodedObject.disclosures?.reduce<Record<string, any>>(
      (acc, { key, value }) => {
        if (key) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );
    console.log('Disclosures:', disclosures);

    // Get the claims from the JWT
    const claims = await sdjwt.getClaims(jwt);
    console.log('Claims:', claims);

    return { claims, disclosures };
  };

  const storeCredential = async (vcObject: any) => {
    try {
      if (await Keychain.setGenericPassword('vc', JSON.stringify(vcObject))) {
        Alert.alert('Success', 'Credential stored successfully');

        setVc(null);
      } else {
        Alert.alert('Failed', 'Credential stored failed');
      }
    } catch (error) {
      console.error('Failed to store credential:', error);
    }
  };

  const unlockAndShow = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { success, error } = await rnBiometrics.simplePrompt({
      promptMessage: 'Unlock with biometric authentication',
      cancelButtonText: 'Cancel',
      fallbackPromptMessage: 'Use Passcode',
    });

    if (success) {
      console.log('Biometric authentication successful');
      const creds = await Keychain.getGenericPassword();
      if (creds) {
        console.log('Credentials retrieved:', creds);
        const parsed = JSON.parse(creds.password);
        setVc(parsed);
      } else {
        console.log('No credentials found');
        Alert.alert('Failed', 'No credentials found');
      }
    } else {
      console.log('Biometric authentication failed', error);
    }
  };

  return (
    <>
      <PolyfillCrypto />

      <Stack.Screen options={{ title: 'Now Auth Holder' }} />

      <View style={styles.body}>
        <Pressable onPress={checkPermissionAndScan}>
          <View style={styles.cameraContainer}>
            {claims ? (
              <Text style={styles.claimsText}>
                {JSON.stringify(claims, null, 2)}
              </Text>
            ) : (
              <Text style={[styles.claimsText, { top: '45%', left: '30%' }]}>
                Show Claims
              </Text>
            )}

            {cameraPermission?.granted && !scanned && (
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                facing='back'
                onBarcodeScanned={handleBarCodeScanned}
              />
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={unlockAndShow}
          style={[
            styles.cameraContainer,
            {
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          {vc ? (
            Object.entries(vc).map(([key, value]) => (
              <View key={key}>
                <Text
                  style={
                    (key === 'initial' || key === 'lastname') &&
                    styles.largeButtonText
                  }
                >
                  {key}: {String(value)}
                </Text>
              </View>
            ))
          ) : (
            <Text>Show Disclosures</Text>
          )}
        </Pressable>
      </View>
    </>
  );
}
