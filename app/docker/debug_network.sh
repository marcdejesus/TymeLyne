#!/bin/sh
# Debug network connectivity script for Docker containers

# Display header
echo "=========================================================="
echo "           TYMELYNE APP - NETWORK DEBUGGER"
echo "=========================================================="
echo ""

# Display container information
echo "CONTAINER INFORMATION:"
echo "---------------------"
hostname=$(hostname)
echo "Container hostname: $hostname"
echo ""

# Display environment variables
echo "ENVIRONMENT VARIABLES:"
echo "---------------------"
echo "NODE_ENV: $NODE_ENV"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_BACKEND_URL: $REACT_APP_BACKEND_URL"
echo "REACT_NATIVE_PACKAGER_HOSTNAME: $REACT_NATIVE_PACKAGER_HOSTNAME"
echo "EXPO_PACKAGER_HOSTNAME: $EXPO_PACKAGER_HOSTNAME"
echo ""

# Display IP information
echo "IP CONFIGURATION:"
echo "----------------"
echo "Container IPs:"
ip addr show | grep -E "inet "
echo ""

# Display routing information
echo "ROUTING INFORMATION:"
echo "------------------"
ip route
echo ""

# Test connectivity to backend
echo "BACKEND CONNECTIVITY TEST:"
echo "------------------------"
echo "Testing connection to backend:8000..."
nc -zv backend 8000 2>&1 || echo "Failed to connect to backend:8000"
echo ""
echo "Testing connection to host.docker.internal:8000..."
nc -zv host.docker.internal 8000 2>&1 || echo "Failed to connect to host.docker.internal:8000"
echo ""

# Get external IP address if available
echo "EXTERNAL IP ADDRESS:"
echo "------------------"
external_ip=$(wget -qO- http://ifconfig.me 2>/dev/null || echo "Not available")
echo "External IP: $external_ip"
echo ""

# Check DNS resolution
echo "DNS RESOLUTION:"
echo "--------------"
echo "Resolving backend..."
getent hosts backend || echo "Failed to resolve 'backend'"
echo ""
echo "Resolving host.docker.internal..."
getent hosts host.docker.internal || echo "Failed to resolve 'host.docker.internal'"
echo ""

# Attempt to ping important services
echo "PING TESTS:"
echo "----------"
echo "Pinging backend..."
ping -c 2 backend || echo "Failed to ping backend"
echo ""
echo "Pinging host.docker.internal..."
ping -c 2 host.docker.internal || echo "Failed to ping host.docker.internal"
echo ""

# Test HTTP connectivity to backend
echo "HTTP CONNECTIVITY TEST:"
echo "---------------------"
echo "Testing HTTP GET to backend:8000/api/"
curl -v --max-time 5 http://backend:8000/api/ 2>&1 || echo "Failed to connect to backend:8000/api/"
echo ""

# Display iptables info if available
echo "IPTABLES RULES (if available):"
echo "---------------------------"
iptables -L 2>/dev/null || echo "iptables not available or permission denied"
echo ""

# Show running processes
echo "RUNNING PROCESSES:"
echo "----------------"
ps aux
echo ""

# Show listening ports
echo "LISTENING PORTS:"
echo "--------------"
netstat -tulpn 2>/dev/null || echo "netstat not available"
echo ""

echo "=========================================================="
echo "           NETWORK DEBUG COMPLETE"
echo "==========================================================" 