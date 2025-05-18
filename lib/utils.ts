import { ES256, digest, generateSalt } from '@sd-jwt/crypto-browser';
export { digest, generateSalt, ES256 };

export default async function createSignerVerifier() {
  const { privateKey, publicKey } = await ES256.generateKeyPair();
  return {
    signer: await ES256.getSigner(privateKey),
    verifier: await ES256.getVerifier(publicKey),
  };
}
