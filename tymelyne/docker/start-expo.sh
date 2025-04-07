#!/bin/sh

echo "Starting Expo server..."

# Install dependencies if needed
npx expo install --check || echo "Dependencies already installed"

# Try standard mode first
echo "Starting in standard mode..."
npx expo start --non-interactive || {
  # Try alternative mode if standard fails
  echo "Standard mode failed, trying development server directly..."
  npx react-native start
} 