# Local Android Build Guide

This guide allows you to build a standalone APK (Dogfooding version) locally, without relying on Expo servers or a running development server.

## 0. Prerequisites
You need **Java (JDK 17)** installed in your WSL environment. All commands below should be run in your WSL terminal.

**Check for Java:**
```bash
java -version
```
If missing, install it:
```bash
sudo dnf install java-17-openjdk-devel
# OR if that package name is wrong for your Fedora version:
sudo dnf search openjdk
sudo dnf install java-latest-openjdk-devel
```

## 1. Ensure Native Project Exists
We have already run this, but if you ever need to regenerate the `android` folder:
```bash
npx expo prebuild --platform android
```

## 2. Generate a Signing Key (Keystore)
To create a standalone "Release" APK, it must be signed. We will create a local keystore.

Run this command in the project root:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore gempill-release.keystore -alias gempill-key -keyalg RSA -keysize 2048 -validity 10000
```
*   **Password**: Use `password` (or something simple you remember for testing).
*   **Details**: functionality doesn't matter, you can hit Enter through them.
*   **Confirm**: Type `yes`.

## 3. Build the APK (Standalone)
Now we invoke Gradle to build the Release APK. We pass the keystore details directly so you don't need to edit complex config files.

Run this command (replace `password` with whatever you chose above):

```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=../../gempill-release.keystore \
  -Pandroid.injected.signing.store.password=password \
  -Pandroid.injected.signing.key.alias=gempill-key \
  -Pandroid.injected.signing.key.password=password
```

## 4. Install
Once finished, the APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

1.  Copy it to your phone (via USB, email, Google Drive, etc.).
2.  Install it.
3.  Run "Gempill". It will work completely offline!
