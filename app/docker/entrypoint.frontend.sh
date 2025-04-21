#!/bin/sh
set -e

echo "Starting Expo server in Docker environment..."

# Install dependencies if node_modules is empty
if [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Get the host IP from environment variable
BACKEND_URL=${REACT_APP_BACKEND_URL:-"http://backend:8000"}
HOST_IP=$(echo $BACKEND_URL | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:[0-9]*$||')
echo "Using backend URL: $BACKEND_URL for API connections"
echo "Host IP for QR code: $HOST_IP"

# Create a React Native config file to store the backend URL
mkdir -p ./src/config
cat > ./src/config/hostConfig.js <<EOL
// This file is generated at runtime - DO NOT EDIT OR COMMIT
export const BACKEND_URL = '$BACKEND_URL';
export const HOST_IP = '$HOST_IP';
EOL

# Create .env file if it does not exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "REACT_APP_API_URL=docker" > .env
  echo "REACT_APP_BACKEND_URL=$BACKEND_URL" >> .env
fi

echo "Waiting for backend service..."
# Wait for backend to be ready - first try internal Docker networking
if nc -z backend 8000; then
  echo "Backend service is available via Docker networking."
else
  # If internal Docker networking fails, try the public URL
  backend_host=$(echo $BACKEND_URL | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:[0-9]*$||')
  backend_port=$(echo $BACKEND_URL | grep -o ':[0-9]*' | sed 's/://')
  backend_port=${backend_port:-8000}
  
  echo "Trying to connect to backend at $backend_host:$backend_port..."
  count=0
  max_retries=30
  
  while ! nc -z $backend_host $backend_port && [ $count -lt $max_retries ]; do
    echo "Backend not available yet. Waiting... ($count/$max_retries)"
    sleep 2
    count=$((count + 1))
  done
  
  if [ $count -lt $max_retries ]; then
    echo "Backend service is available via public URL."
  else
    echo "WARNING: Could not connect to backend. The app may not function correctly."
  fi
fi

# Output debug information
echo "=========================="
echo "ENVIRONMENT CONFIGURATION:"
echo "=========================="
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_BACKEND_URL: $REACT_APP_BACKEND_URL"
echo "EXPO_PACKAGER_HOSTNAME: $EXPO_PACKAGER_HOSTNAME"
echo "EXPO_DEVTOOLS_LISTEN_ADDRESS: $EXPO_DEVTOOLS_LISTEN_ADDRESS"
echo "REACT_NATIVE_PACKAGER_HOSTNAME: $REACT_NATIVE_PACKAGER_HOSTNAME"
echo "=========================="

# Start Expo in a way that works with Docker and exposes the QR code
echo "Starting Expo server..."
# We need to use --host-type lan to make it accessible from your phone
exec npx expo start --host-type lan 