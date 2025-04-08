#!/bin/bash

# Find local IP address
LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# If ifconfig doesn't work, try ip command
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip addr show | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
fi

if [ -z "$LOCAL_IP" ]; then
    echo "Error: Could not detect local IP address."
    exit 1
fi

echo "Detected local IP: $LOCAL_IP"
echo "Updating frontend API configuration..."

# Replace YOUR_LOCAL_IP with the actual IP in the api.js file
sed -i '' "s/const LOCAL_IP = 'YOUR_LOCAL_IP';/const LOCAL_IP = '$LOCAL_IP';/g" frontend/src/api/api.js

echo "✅ Updated API_URL in frontend/src/api/api.js"
echo "API URL set to: http://$LOCAL_IP:8000"
echo ""
echo "Now you can run the backend and frontend:"
echo "  1. cd backend && ./run_with_ip.sh"
echo "  2. cd frontend && npx expo start"
echo ""
echo "Use Expo Go on your phone to scan the QR code from the Expo CLI." 