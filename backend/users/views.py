from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.utils import timezone
from .serializers import (
    UserSerializer, 
    UserUpdateSerializer, 
    AdminUserUpdateSerializer,
    RegisterSerializer,
    LoginSerializer,
    PasswordChangeSerializer
)
from .utils import generate_tokens_for_user
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

User = get_user_model()

class IsUserOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile
    or admins to edit any profile.
    """
    def has_object_permission(self, request, view, obj):
        # Always allow GET, HEAD or OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow admin users
        if request.user.role == User.Roles.ADMIN:
            return True
        
        # Allow users to edit themselves
        return obj == request.user

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users to view or edit their profile.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsUserOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """
        Restrict users to seeing only their own profile unless they're an admin.
        """
        user = self.request.user
        if user.role == User.Roles.ADMIN:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        """
        Use different serializers based on action.
        """
        if self.action == 'update' or self.action == 'partial_update':
            if self.request.user.role == User.Roles.ADMIN:
                return AdminUserUpdateSerializer
            return UserUpdateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get the current user's profile.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], parser_classes=[MultiPartParser, FormParser])
    def update_me(self, request):
        """
        Update the current user's profile.
        """
        user = request.user
        if user.role == User.Roles.ADMIN:
            serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        else:
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Change user password.
        """
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request):
        """
        Upload a new avatar image.
        """
        user = request.user
        avatar_file = request.FILES.get('avatar')
        
        if not avatar_file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check file size and type
        if avatar_file.size > 5 * 1024 * 1024:  # 5MB limit
            return Response({"error": "File too large (max 5MB)"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not avatar_file.content_type.startswith('image/'):
            return Response({"error": "File is not an image"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the file
        user.avatar = avatar_file
        user.save()
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    """
    Register a new user.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the user
        tokens = generate_tokens_for_user(user)
        
        # Trigger user_logged_in signal
        user_logged_in.send(sender=user.__class__, request=request, user=user)
        
        # Update login stats
        user.login_count = 1
        user.last_login = timezone.now()
        if request.META.get('REMOTE_ADDR'):
            user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save(update_fields=['login_count', 'last_login', 'last_login_ip'])
        
        # Return the user data with tokens
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "tokens": tokens,
            "message": "User registered successfully"
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """
    Login a user and return tokens.
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Trigger user_logged_in signal
        user_logged_in.send(sender=user.__class__, request=request, user=user)
        
        # Update login stats
        user.login_count += 1
        user.last_login = timezone.now()
        if request.META.get('REMOTE_ADDR'):
            user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save(update_fields=['login_count', 'last_login', 'last_login_ip'])
        
        # Return tokens and user data
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "tokens": serializer.get_tokens({'user': user}),
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout the user.
    """
    # Trigger user_logged_out signal
    user_logged_out.send(sender=request.user.__class__, request=request, user=request.user)
    
    return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    API view for initiating a password reset
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if user with this email exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist for security reasons
            return Response(
                {'message': 'If a user with this email exists, a password reset link has been sent'},
                status=status.HTTP_200_OK
            )
            
        # Generate a token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build the reset URL - in a real implementation, this would be a frontend URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send the email
        try:
            # In a production app, you would send a real email here
            # For now, just log it
            print(f"Password reset link for {email}: {reset_url}")
            
            # You could implement email sending here:
            # send_mail(
            #     'Reset your password',
            #     f'Click the link to reset your password: {reset_url}',
            #     settings.DEFAULT_FROM_EMAIL,
            #     [email],
            #     fail_silently=False,
            # )
            
            return Response(
                {'message': 'If a user with this email exists, a password reset link has been sent'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to send reset email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 