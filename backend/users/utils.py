import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def generate_tokens_for_user(user):
    """
    Generate JWT tokens for a user
    """
    refresh = RefreshToken.for_user(user)
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class JWTAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for JWT tokens.
    """
    def authenticate(self, request):
        # Get the JWT token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode the JWT token
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            
            # Get the user ID from the token
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
            
            # Get the user from the database
            try:
                user = User.objects.get(id=user_id)
                
                # Check if token is expired
                exp = payload.get('exp')
                if exp and datetime.now().timestamp() > exp:
                    raise AuthenticationFailed('Token has expired')
                    
                return (user, token)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
                
        except jwt.PyJWTError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        
        return None 