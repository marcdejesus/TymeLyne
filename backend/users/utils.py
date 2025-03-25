import os
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Supabase JWT tokens.
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
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={"verify_signature": True}
            )
            
            # Get the Supabase user ID from the token
            supabase_id = payload.get('sub')
            if not supabase_id:
                raise AuthenticationFailed('Invalid token payload')
            
            # Get or create the user in our system
            try:
                user = User.objects.get(supabase_id=supabase_id)
                
                # Update user data from payload if anything changed
                email = payload.get('email')
                if email and user.email != email:
                    user.email = email
                    user.save(update_fields=['email'])
                    
            except User.DoesNotExist:
                # If the user doesn't exist in our system yet, but has a valid Supabase token,
                # create a new user in our system
                email = payload.get('email', '')
                if not email:
                    raise AuthenticationFailed('Email not found in token')
                
                # Get user metadata if available
                user_metadata = payload.get('user_metadata', {})
                full_name = user_metadata.get('full_name', '')
                
                # Create the user with data from Supabase
                user = User.objects.create(
                    username=email,
                    email=email,
                    full_name=full_name,
                    supabase_id=supabase_id,
                    is_active=True
                )
            
            return (user, token)
        except jwt.PyJWTError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        
        return None 