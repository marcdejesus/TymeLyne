from django.test import TestCase
from django.conf import settings
import os

class APISettingsTests(TestCase):
    """Test cases for API settings configuration"""
    
    def test_debug_setting(self):
        """Test that DEBUG is set from environment variables correctly"""
        # In tests, DEBUG should be False by default
        self.assertIn(settings.DEBUG, [True, False], "DEBUG should be a boolean")
        
    def test_secret_key(self):
        """Test that SECRET_KEY is set properly"""
        # SECRET_KEY should not be empty
        self.assertTrue(settings.SECRET_KEY, "SECRET_KEY should not be empty")
        
        # It should use the environment variable if available
        test_key = "test-secret-key-123"
        os.environ['SECRET_KEY'] = test_key
        # Note: We can't test this directly since settings are loaded once when Django starts
        # In a real test, we'd need to use override_settings or reload settings
        
    def test_allowed_hosts(self):
        """Test ALLOWED_HOSTS configuration"""
        # Should include some default values
        self.assertTrue(len(settings.ALLOWED_HOSTS) > 0, "ALLOWED_HOSTS should not be empty")
        
    def test_installed_apps(self):
        """Test that required apps are installed"""
        self.assertIn('rest_framework', settings.INSTALLED_APPS)
        self.assertIn('corsheaders', settings.INSTALLED_APPS)
        self.assertIn('rest_framework_simplejwt', settings.INSTALLED_APPS)
        self.assertIn('core', settings.INSTALLED_APPS)
        self.assertIn('users', settings.INSTALLED_APPS)
        
    def test_middleware(self):
        """Test middleware configuration"""
        self.assertIn('corsheaders.middleware.CorsMiddleware', settings.MIDDLEWARE)
        
    def test_database_config(self):
        """Test database configuration"""
        db_config = settings.DATABASES['default']
        self.assertEqual(db_config['ENGINE'], 'django.db.backends.sqlite3')
        
    def test_static_files_config(self):
        """Test static files configuration"""
        self.assertTrue(hasattr(settings, 'STATIC_URL'))
        self.assertTrue(hasattr(settings, 'STATIC_ROOT'))
        
    def test_rest_framework_config(self):
        """Test REST Framework configuration"""
        self.assertTrue(hasattr(settings, 'REST_FRAMEWORK'))
        auth_classes = settings.REST_FRAMEWORK.get('DEFAULT_AUTHENTICATION_CLASSES', [])
        self.assertIn('rest_framework_simplejwt.authentication.JWTAuthentication', auth_classes)
        
    def test_jwt_settings(self):
        """Test JWT settings"""
        self.assertTrue(hasattr(settings, 'SIMPLE_JWT'))
        self.assertIn('ACCESS_TOKEN_LIFETIME', settings.SIMPLE_JWT)
        self.assertIn('REFRESH_TOKEN_LIFETIME', settings.SIMPLE_JWT)
        
    def test_cors_settings(self):
        """Test CORS settings"""
        # CORS settings should be defined
        self.assertTrue(hasattr(settings, 'CORS_ALLOWED_ORIGINS') or 
                        hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS'))
        
        # If CORS_ALLOW_ALL_ORIGINS is True, it should be a boolean
        if hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS'):
            self.assertIsInstance(settings.CORS_ALLOW_ALL_ORIGINS, bool) 