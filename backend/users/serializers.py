from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, includes all necessary fields for displaying a user.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'full_name', 'role', 'avatar', 'avatar_url', 'bio', 
            'date_of_birth', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_active', 'created_at', 'updated_at']

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating User information. Only allows updating specific fields.
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'full_name', 'bio', 
            'date_of_birth', 'avatar', 'avatar_url'
        ]
    
    def validate_avatar(self, value):
        """
        Validate avatar file size and type
        """
        if value:
            # 5MB file size limit
            if value.size > 5 * 1024 * 1024:
                raise ValidationError("Image file too large (max 5MB)")
            
            # Check file type
            if not value.content_type.startswith('image/'):
                raise ValidationError("File is not an image")
        
        return value

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for admin users to update other users, including role.
    """
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'bio', 'date_of_birth', 'avatar', 'avatar_url', 'is_active'
        ]
    
    def validate_avatar(self, value):
        """
        Validate avatar file size and type
        """
        if value:
            # 5MB file size limit
            if value.size > 5 * 1024 * 1024:
                raise ValidationError("Image file too large (max 5MB)")
            
            # Check file type
            if not value.content_type.startswith('image/'):
                raise ValidationError("File is not an image")
        
        return value 