from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserUpdateSerializer, AdminUserUpdateSerializer

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
    
    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        """
        Update the current user's profile.
        """
        if request.user.role == User.Roles.ADMIN:
            serializer = AdminUserUpdateSerializer(request.user, data=request.data, partial=True)
        else:
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 