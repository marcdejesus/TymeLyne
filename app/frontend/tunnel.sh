#!/bin/bash

# Install expo-cli globally if needed
if ! command -v expo &> /dev/null
then
    echo "Installing expo-cli globally..."
    npm install -g expo-cli
fi

# Check if @expo/tunnel is installed
if ! npm list -g | grep -q "@expo/ngrok"
then
    echo "Installing @expo/ngrok dependency for tunnel mode..."
    npm install -g @expo/ngrok
fi

echo "Starting Expo with tunnel mode..."
echo "This will create a tunnel that bypasses network restrictions."
echo "Tunnel mode is the most reliable way to connect your phone to the backend API."

# Start expo with tunnel mode
npx expo start --tunnel 