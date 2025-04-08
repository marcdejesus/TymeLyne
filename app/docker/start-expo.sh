#!/bin/sh
set -e

echo "Starting Expo server in Docker environment..."

# Install dependencies if node_modules is empty
if [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "REACT_APP_API_URL=docker" > .env
fi

# Wait for backend to be ready
echo "Waiting for backend service..."
while ! nc -z backend 8000; do
  sleep 1
done
echo "Backend service is available."

# Start Expo in a way that works with Docker
echo "Starting Expo server..."
# Older versions of Expo require the --lan flag
npx expo start --lan --port 19000 