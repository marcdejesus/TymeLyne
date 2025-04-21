import unittest
import socket
import requests
import os
import time
from urllib.parse import urlparse
import threading
import subprocess
from django.core.management import call_command
from django.conf import settings
import sys

class APIConnectivityTests(unittest.TestCase):
    """Tests for API connectivity and network configuration"""
    
    @classmethod
    def setUpClass(cls):
        """Initialize test server if needed"""
        # These tests might be run in different environments:
        # 1. As part of Django test suite
        # 2. Standalone to verify network connectivity
        # 3. Within Docker to test container networking
        cls.server_thread = None
        cls.server_url = os.environ.get("TEST_SERVER_URL", "http://localhost:8000")
        
        # Only start a test server if we're running standalone and no server is specified
        if "TEST_SERVER_URL" not in os.environ and not cls._is_server_running(cls.server_url):
            # Start Django test server in a separate thread
            cls.server_thread = threading.Thread(
                target=cls._run_test_server,
                daemon=True
            )
            cls.server_thread.start()
            time.sleep(1)  # Give server time to start
    
    @staticmethod
    def _is_server_running(url):
        """Check if a server is already running at the specified URL"""
        try:
            parsed_url = urlparse(url)
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                return s.connect_ex((parsed_url.hostname or "localhost", 
                                    parsed_url.port or 80)) == 0
        except Exception:
            return False
    
    @staticmethod
    def _run_test_server():
        """Run a test Django server"""
        try:
            # This runs the Django development server for testing
            call_command("runserver", "0.0.0.0:8000", "--noreload")
        except Exception as e:
            print(f"Error starting test server: {e}")
            
    def test_server_running(self):
        """Test that the API server is accessible"""
        try:
            response = requests.get(f"{self.server_url}/api-auth/", timeout=5)
            self.assertEqual(response.status_code, 200, 
                            f"API server should return status 200, got {response.status_code}")
        except requests.RequestException as e:
            self.fail(f"Could not connect to API server: {e}")
            
    def test_cors_headers(self):
        """Test that CORS headers are properly set"""
        try:
            # Options request to check CORS headers
            response = requests.options(
                f"{self.server_url}/api-auth/", 
                headers={"Origin": "http://localhost:19000"},
                timeout=5
            )
            
            # Check for CORS headers in response
            self.assertIn("Access-Control-Allow-Origin", response.headers,
                         "CORS headers should be present")
        except requests.RequestException as e:
            self.fail(f"Could not connect to API server: {e}")
            
    def test_network_interfaces(self):
        """Test that server listens on appropriate network interfaces"""
        # Get local IP addresses
        local_ips = self._get_local_ips()
        
        for ip in local_ips:
            try:
                # Try to connect to the API on each interface
                url = f"http://{ip}:8000/api-auth/"
                response = requests.get(url, timeout=2)
                
                # If we get here, the connection succeeded
                self.assertEqual(response.status_code, 200,
                               f"API should be accessible on {ip}")
                return  # One success is enough
            except requests.RequestException:
                # Connection failed on this interface, try next one
                continue
                
        # If we get here, all connection attempts failed
        self.fail("Could not connect to API on any local network interface")
            
    def _get_local_ips(self):
        """Get all local IP addresses"""
        local_ips = []
        try:
            # Get all network interfaces
            hostname = socket.gethostname()
            local_ips.append(socket.gethostbyname(hostname))
            
            # Always include localhost
            local_ips.append("127.0.0.1")
        except Exception:
            pass
            
        return local_ips
        
if __name__ == "__main__":
    unittest.main() 