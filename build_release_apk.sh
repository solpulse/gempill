#!/bin/bash
set -e

echo "🔨 Starting Local Release Build..."

# Ensure native project is up to date
EXPO_NO_TELEMETRY=1 CI=1 npx expo prebuild --platform android --no-install --clean

# ============================================================
# PERMISSION STRATEGY: Exact Alarms (Android 13/14+)
# ------------------------------------------------------------
# Option A (PRE-GRANTED): Keep android.permission.USE_EXACT_ALARM.
#   - Pros: Granted at install. No manual user work. Reliable alarms.
#   - Cons: Play Store might require a declaration for "Alarm/Reminders" app.
# Option B (USER-GRANTED): Remove USE_EXACT_ALARM, keep SCHEDULE_EXACT_ALARM.
#   - Pros: Play Store safe for almost all apps.
#   - Cons: DISABLED BY DEFAULT on Android 14+. Requires manual user toggle.
# ============================================================
STRIP_FOR_PLAYSTORE=false # Set to true to force SCHEDULE_EXACT_ALARM behavior

if [ "$STRIP_FOR_PLAYSTORE" = true ] && [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    echo "🧹 [STRATEGY: PlayStore] Stripping USE_EXACT_ALARM to force-reveal toggle..."
    sed -i '/android.permission.USE_EXACT_ALARM/d' android/app/src/main/AndroidManifest.xml
else
    echo "🚀 [STRATEGY: Reliability] Keeping USE_EXACT_ALARM for pre-granted reliability."
fi
# ============================================================

# ============================================================
# INJECT: Custom BroadcastReceiver for notification actions
# This fixes the notification drawer collapse issue on Android 12+.
# Notifee uses PendingIntent.getActivities() which forces drawer to close.
# Our BroadcastReceiver uses PendingIntent.getBroadcast() which keeps it open.
# ============================================================
MANIFEST="android/app/src/main/AndroidManifest.xml"
JAVA_DIR="android/app/src/main/java/com/anonymous/Gempill"

echo "🔧 Injecting custom notification action receiver..."

# 1. Register BroadcastReceiver in AndroidManifest.xml (if not already present)
if ! grep -q "NotificationActionReceiver" "$MANIFEST"; then
    echo "   ↳ Adding receiver declaration to AndroidManifest.xml"
    sed -i 's|</application>|    <receiver\n      android:name=".NotificationActionReceiver"\n      android:exported="false">\n      <intent-filter>\n        <action android:name="com.anonymous.Gempill.NOTIFICATION_ACTION"/>\n      </intent-filter>\n    </receiver>\n  </application>|' "$MANIFEST"
fi

# 2. Register NotificationActionsPackage in MainApplication.kt (if not already present)
MAIN_APP="$JAVA_DIR/MainApplication.kt"
if [ -f "$MAIN_APP" ] && ! grep -q "NotificationActionsPackage" "$MAIN_APP"; then
    echo "   ↳ Adding NotificationActionsPackage to MainApplication.kt"
    sed -i 's|// add(MyReactNativePackage())|add(NotificationActionsPackage())|' "$MAIN_APP"
fi

# 3. Copy our native Kotlin files (they may have been removed by prebuild)
SOURCE_DIR="native_patches"
if [ -d "$SOURCE_DIR" ]; then
    echo "   ↳ Copying native Kotlin files from $SOURCE_DIR/"
    cp -f "$SOURCE_DIR/NotificationActionReceiver.kt" "$JAVA_DIR/" 2>/dev/null || true
    cp -f "$SOURCE_DIR/NotificationActionsModule.kt" "$JAVA_DIR/" 2>/dev/null || true
    cp -f "$SOURCE_DIR/NotificationActionsPackage.kt" "$JAVA_DIR/" 2>/dev/null || true
fi

echo "✅ Custom notification patches applied."
# ============================================================

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

cd ..

# Extract version from package.json using node
VERSION=$(node -p "require('./package.json').version")
OUTPUT_DIR="testbuilds"
OUTPUT_FILE="$OUTPUT_DIR/gempill_build_v${VERSION}.apk"

# Ensure the testbuilds directory exists
mkdir -p "$OUTPUT_DIR"

# Copy the built APK to the testbuilds directory with the new name
cp android/app/build/outputs/apk/release/app-release.apk "$OUTPUT_FILE"

echo "✅ Build Complete!"
echo "📂 APK Location: $(pwd)/$OUTPUT_FILE"
