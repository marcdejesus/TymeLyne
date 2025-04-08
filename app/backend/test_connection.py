"""
Test script for checking API connectivity.
This is a diagnostic tool to help identify network issues between
your phone and the Django backend.
"""

import sys
import socket
import requests
from urllib.parse import urlparse

def check_local_network():
    """Get and display the local network information."""
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"Hostname: {hostname}")
    print(f"Local IP: {local_ip}")
    
    # Try to get all available IPs
    try:
        import netifaces
        for interface in netifaces.interfaces():
            addrs = netifaces.ifaddresses(interface)
            if netifaces.AF_INET in addrs:
                for addr in addrs[netifaces.AF_INET]:
                    print(f"Interface {interface}: {addr['addr']}")
    except ImportError:
        print("netifaces not installed. Try: pip install netifaces")
        
        # Alternative method
        try:
            import subprocess
            result = subprocess.run(['ifconfig'], capture_output=True, text=True)
            print("\nNetwork interfaces (ifconfig):")
            print(result.stdout)
        except:
            try:
                result = subprocess.run(['ip', 'addr'], capture_output=True, text=True)
                print("\nNetwork interfaces (ip addr):")
                print(result.stdout)
            except:
                print("Could not get detailed network information.")

def test_api_connection(url):
    """Test the API connection."""
    parsed_url = urlparse(url)
    
    # Test if the host is reachable
    hostname = parsed_url.netloc.split(':')[0]
    port = parsed_url.port or 80
    
    print(f"\nTesting connection to {hostname} on port {port}...")
    
    # Try to connect to the socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    result = sock.connect_ex((hostname, port))
    if result == 0:
        print(f"Socket connection successful to {hostname}:{port}")
    else:
        print(f"Socket connection failed to {hostname}:{port} (Error: {result})")
    sock.close()
    
    # Try HTTP request
    print(f"\nTesting HTTP connection to {url}...")
    try:
        response = requests.get(url, timeout=5)
        print(f"HTTP Status: {response.status_code}")
        print(f"Response: {response.text[:100]}...")
    except requests.exceptions.RequestException as e:
        print(f"HTTP connection failed: {str(e)}")

def main():
    """Main function."""
    print("\n=== Network Diagnostic Tool ===\n")
    check_local_network()
    
    api_url = "http://localhost:8000/api/tasks/"
    if len(sys.argv) > 1:
        api_url = sys.argv[1]
    
    test_api_connection(api_url)
    
    print("\n=== Troubleshooting Tips ===")
    print("1. Make sure your phone and computer are on the same WiFi network")
    print("2. Check your computer's firewall to allow connections on port 8000")
    print("3. Try connecting via Expo's 'tunnel' option (type 't' in Expo CLI)")
    print("4. Update the API_URL in frontend/src/api/api.js with the correct IP")
    print("5. Make sure Django is running with: 'python manage.py runserver 0.0.0.0:8000'")

if __name__ == "__main__":
    main() 