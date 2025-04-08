from rest_framework import serializers
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    User, UserProfile, Course, Module, Lesson, Activity, 
    UserCourseProgress, UserActivityProgress, Achievement, 
    UserAchievement, Certificate
)

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = [
            'id', 'display_name', 'bio', 'avatar', 'xp', 'level', 'days_streak',
            'theme_preference', 'accent_color', 'total_courses_completed', 
            'total_lessons_completed', 'total_learning_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'xp', 'level', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile details"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user details"""
    profile = ProfileSerializer()
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'profile']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for creating new user accounts"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        with transaction.atomic():
            validated_data.pop('password2')
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
            )
            user.set_password(validated_data['password'])
            user.save()
            
            # Profile is created automatically via signals
            
            return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user data"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user and profile data to the token response
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        # Add profile data
        try:
            profile = user.profile
            data['profile'] = {
                'display_name': profile.display_name,
                'avatar': profile.avatar.url if profile.avatar else None,
                'xp': profile.xp,
                'level': profile.level,
                'days_streak': profile.days_streak,
                'theme_preference': profile.theme_preference,
                'accent_color': profile.accent_color,
            }
        except UserProfile.DoesNotExist:
            data['profile'] = None
            
        return data


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    class Meta:
        model = Course
        fields = '__all__'


class ModuleSerializer(serializers.ModelSerializer):
    """Serializer for Module model"""
    class Meta:
        model = Module
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model"""
    class Meta:
        model = Lesson
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model"""
    class Meta:
        model = Activity
        fields = '__all__'


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed Course serializer with modules, lessons and activities"""
    modules = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_modules(self, obj):
        modules = obj.modules.all().order_by('order')
        return ModuleDetailSerializer(modules, many=True).data


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Detailed Module serializer with lessons"""
    lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = '__all__'
    
    def get_lessons(self, obj):
        lessons = obj.lessons.all().order_by('order')
        return LessonDetailSerializer(lessons, many=True).data


class LessonDetailSerializer(serializers.ModelSerializer):
    """Detailed Lesson serializer with activities"""
    activities = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = '__all__'
    
    def get_activities(self, obj):
        activities = obj.activities.all().order_by('order')
        return ActivitySerializer(activities, many=True).data


class UserCourseProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserCourseProgress model"""
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = UserCourseProgress
        fields = '__all__'


class UserActivityProgressSerializer(serializers.ModelSerializer):
    """Serializer for UserActivityProgress model"""
    activity_details = ActivitySerializer(source='activity', read_only=True)
    
    class Meta:
        model = UserActivityProgress
        fields = '__all__'


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievement model"""
    class Meta:
        model = Achievement
        fields = '__all__'


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for UserAchievement model"""
    achievement_details = AchievementSerializer(source='achievement', read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = '__all__'


class CertificateSerializer(serializers.ModelSerializer):
    """Serializer for Certificate model"""
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = Certificate
        fields = '__all__' 