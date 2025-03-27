#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install required packages if needed
pip install requests netifaces

# Find local IP address
LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# If ifconfig doesn't work, try ip command
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip addr show | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
fi

# Run the connectivity test
echo "Running network diagnostic with IP: $LOCAL_IP"
python3 test_connection.py "http://$LOCAL_IP:8000/api/tasks/" 