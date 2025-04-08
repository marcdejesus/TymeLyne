#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Find local IP address
LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# If ifconfig doesn't work, try ip command
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip addr show | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
fi

# Display helpful connection information
echo "========================================================"
echo "Django server starting on local IP: $LOCAL_IP:8000"
echo ""
echo "IMPORTANT: Update your frontend API_URL to:"
echo "const API_URL = 'http://$LOCAL_IP:8000';"
echo ""
echo "In Expo Go, use this IP to connect to your API."
echo "========================================================"

# Run Django server on all network interfaces
python3 manage.py runserver 0.0.0.0:8000 