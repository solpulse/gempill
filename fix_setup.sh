#!/bin/bash

# Exit on error
set -e

echo "🔧 Starting Fix Setup..."

# 1. Install NVM (Node Version Manager)
echo "📥 Installing NVM..."
export NVM_DIR="$HOME/.nvm"
mkdir -p "$NVM_DIR"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Configure .bashrc for NVM
echo "📝 Configuring .bashrc for NVM..."
if ! grep -q "NVM_DIR" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# NVM Configuration" >> ~/.bashrc
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion' >> ~/.bashrc
    echo "✅ Added NVM to .bashrc"
else
    echo "ℹ️ NVM already in .bashrc"
fi

# Load NVM immediately for this script
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Install Node.js LTS
echo "🟢 Installing Node.js LTS..."
nvm install --lts
nvm use --lts
nvm alias default lts/*

# 4. Configure Android SDK (Windows Path)
WINDOWS_USER="solta"
WIN_ANDROID_HOME="/mnt/c/Users/$WINDOWS_USER/AppData/Local/Android/Sdk"

echo "📱 Configuring Android SDK..."
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Android SDK (Windows)" >> ~/.bashrc
    echo "export ANDROID_HOME=$WIN_ANDROID_HOME" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
    echo "✅ Added Android SDK to .bashrc"
else
    echo "ℹ️ Android SDK already in .bashrc"
fi

echo "🎉 Fix Complete!"
echo "IMPORTANT: Close this terminal and open a new one, or run 'source ~/.bashrc' to apply changes."
