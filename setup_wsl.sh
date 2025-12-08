#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting WSL Fedora Setup for React Native..."

# 1. Update System and Install Basic Tools
echo "📦 Updating system and installing base tools..."
sudo dnf update -y
sudo dnf install -y git curl wget unzip tar openssl-devel

# 2. Install Java (OpenJDK 17 is required for React Native)
echo "☕ Installing OpenJDK 17..."
sudo dnf install -y java-17-openjdk-devel

# 3. Install Node.js using NVM (Node Version Manager)
echo "🟢 Installing NVM and Node.js LTS..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM for this session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install LTS version of Node
nvm install --lts
nvm use --lts
nvm alias default lts/*

# 4. Install Watchman (File watcher, important for Metro bundler)
echo "👀 Installing Watchman..."
# Watchman is often available in Fedora repos, if not we might need to skip or build from source.
# Trying standard install first.
if sudo dnf list watchman &>/dev/null; then
    sudo dnf install -y watchman
else
    echo "⚠️ Watchman not found in default repos. Skipping for now (you may need to enable a COPR repo)."
fi

# 5. Configure Android SDK (Linking to Windows Android SDK)
# Assuming Windows username is 'solta' based on the file path provided.
WINDOWS_USER="solta"
WIN_ANDROID_HOME="/mnt/c/Users/$WINDOWS_USER/AppData/Local/Android/Sdk"

echo "📱 Configuring Android SDK environment variables..."

if [ -d "$WIN_ANDROID_HOME" ]; then
    echo "✅ Found Windows Android SDK at $WIN_ANDROID_HOME"
    
    # Add to .bashrc if not already there
    if ! grep -q "ANDROID_HOME" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# Android SDK (Windows)" >> ~/.bashrc
        echo "export ANDROID_HOME=$WIN_ANDROID_HOME" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
        echo "✅ Added Android SDK paths to ~/.bashrc"
    else
        echo "ℹ️ Android SDK paths already present in ~/.bashrc"
    fi
else
    echo "⚠️ Could not find Windows Android SDK at $WIN_ANDROID_HOME"
    echo "   Please ensure you have installed Android Studio on Windows and the SDK is in the default location."
fi

echo "🎉 Setup Complete!"
echo "Please restart your terminal or run 'source ~/.bashrc' to apply changes."
echo "You can verify installation by running:"
echo "  git --version"
echo "  node -v"
echo "  java -version"
