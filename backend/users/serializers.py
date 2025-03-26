from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .utils import generate_tokens_for_user
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user objects.
    """
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'avatar', 'avatar_url', 'bio', 'role', 'date_of_birth', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_avatar_url(self, obj):
        """Return the URL of the avatar"""
        return obj.avatar_full_url

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for user updates. Regular users can only update certain fields.
    """
    class Meta:
        model = User
        fields = ['full_name', 'avatar', 'bio', 'date_of_birth']

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for admin user updates. Admins can update more fields.
    """
    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'avatar', 'bio', 'role', 'date_of_birth', 'is_active']

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'full_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data.get('full_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255, write_only=True)
    tokens = serializers.SerializerMethodField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try to authenticate with username/password
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )

            # If username auth fails, try email
            if not user:
                try:
                    # Use filter().first() instead of get() to avoid MultipleObjectsReturned error
                    user_obj = User.objects.filter(email=username).first()
                    if user_obj:
                        user = authenticate(
                            request=self.context.get('request'),
                            username=user_obj.username,
                            password=password
                        )
                except Exception as e:
                    print(f"Error authenticating by email: {e}")
                    user = None

            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        attrs['user'] = user
        return attrs

    def get_tokens(self, obj):
        user = obj.get('user')
        return generate_tokens_for_user(user)
        
class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

    def validate_old_password(self, value):
        """
        Validate old password
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user 