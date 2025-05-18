# Now Auth Holder

An easy-to-use mobile app built with React Native and Expo to scan, verify, and securely store digital credentials.

## Features

- **Scan QR codes** to receive secure digital credentials (SD-JWT).
- **Verify** credential signatures directly on your phone—no internet needed.
- **Store** verified credentials safely with biometric protection (Face ID, fingerprint, or device PIN).
- **Quickly view** your stored credentials whenever you need them.

## How It Works

- **Scan**: Open the app, tap to activate the camera, and scan a QR code containing your digital credential.
- **Verify**: The app automatically verifies the credential is authentic.
- **Securely Save**: Credentials are securely stored on your device.
- **View Credentials**: Use biometric authentication to safely access and view your credentials anytime.

## Quick Start

Follow these easy steps to get the app running on your device:

### Step 1: Download the App

Clone this repository:

```
git clone https://github.com/JunbinDeng/now-auth.git
cd now-auth
```

### Step 2: Install dependencies

```
npm install
```

or

```
yarn install
```

### Step 3: Run the App

Start the development server:

```
npx expo run:android
```

> **Note**: For biometrics and secure storage features, run the app using Expo Development Client (Expo Go app is not supported for these advanced features).

### Step 4: Generate your SD-JWT and QR code

1. Go to [sdjwt.co](https://www.sdjwt.co/) and enter a JSON payload like:

   ```
   {
     "proof": {
       "jwt": "YOUR_SDJWT"
     }
   }
   ```

   Copy the generated SD-JWT string.

2. Visit [y56y.com/qrcodebatch](https://y56y.com/qrcodebatch), paste your SD-JWT, and generate a QR code.

3. Download or screenshot the QR code image so you can scan it with the app.

## Technology

- **React Native** (with Expo)
- **Expo Camera** for QR code scanning
- **SD-JWT** for secure digital credential verification
- **Biometric Authentication** (Face ID, Touch ID, Fingerprint)
- **Secure Storage** via the device’s native Keychain (iOS) or Keystore (Android)

## Need Help?

Encountered issues? Check these quick tips:

- **App not running?** Ensure you’ve installed all dependencies (npm install).
- **Biometric prompt not showing?** Use a physical device that supports biometrics, and ensure you are using Expo Dev Client (not Expo Go).

## License

MIT License. See [LICENSE](./LICENSE) for details.
