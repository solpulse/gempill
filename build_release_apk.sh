#!/bin/bash
set -e

echo "🔨 Starting Local Release Build..."

# Ensure native project is up to date
npx expo prebuild --platform android

# 1. Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed or not in PATH."
    echo "Please run: brew install openjdk@17"
    exit 1
fi

# 2. Key Generation (if missing)
KEYSTORE_FILE="gempill-release.keystore"
ALIAS="gempill-key"
PASS="password" # Default password for convenience

if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "🔑 Generating Keystore..."
    keytool -genkeypair -v -storetype PKCS12 -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000 -storepass "$PASS" -keypass "$PASS" -dname "CN=Gempill, OU=Local, O=Local, L=Local, S=Local, C=US"
else
    echo "ℹ️  Using existing keystore: $KEYSTORE_FILE"
fi

# 3. Build
echo "🏗️  Building APK with Gradle..."

# Get absolute path to keystore
KEYSTORE_PATH="$(pwd)/$KEYSTORE_FILE"

cd android
chmod +x gradlew
./gradlew assembleRelease \
  -x lintVitalAnalyzeRelease \
  -Pkotlin.jvm.toolchain.version=17 \
  -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
  -Pandroid.injected.signing.store.password="$PASS" \
  -Pandroid.injected.signing.key.alias="$ALIAS" \
  -Pandroid.injected.signing.key.password="$PASS"

echo "✅ Build Complete!"
echo "📂 APK Location: android/app/build/outputs/apk/release/app-release.apk"
