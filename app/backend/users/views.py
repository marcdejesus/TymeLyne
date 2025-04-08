from django.shortcuts import render
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import (
    User, UserProfile, Course, Module, Lesson, Activity, 
    UserCourseProgress, UserActivityProgress, Achievement, 
    UserAchievement, Certificate
)
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    UserUpdateSerializer, CourseSerializer, ModuleSerializer, LessonSerializer,
    ActivitySerializer, CourseDetailSerializer, UserCourseProgressSerializer,
    UserActivityProgressSerializer, AchievementSerializer, UserAchievementSerializer,
    CertificateSerializer
)

class RegisterView(generics.CreateAPIView):
    """View for user registration"""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that returns user data with the token"""
    serializer_class = CustomTokenObtainPairSerializer


class UserDetailView(generics.RetrieveAPIView):
    """View for getting current user details"""
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """View for updating user details"""
    permission_classes = (IsAuthenticated,)
    serializer_class = UserUpdateSerializer
    
    def get_object(self):
        return self.request.user


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for Course model"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer
    
    def perform_create(self, serializer):
        """Set creator to current user for AI-generated courses"""
        if serializer.validated_data.get('is_ai_generated', False):
            serializer.save(creator=self.request.user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll the current user in this course"""
        course = self.get_object()
        user = request.user
        
        # Check if user is already enrolled
        progress, created = UserCourseProgress.objects.get_or_create(
            user=user,
            course=course
        )
        
        if created:
            return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Already enrolled in this course'}, status=status.HTTP_200_OK)


class ModuleViewSet(viewsets.ModelViewSet):
    """ViewSet for Module model"""
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]


class LessonViewSet(viewsets.ModelViewSet):
    """ViewSet for Lesson model"""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]


class ActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for Activity model"""
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark an activity as completed and award XP"""
        activity = self.get_object()
        user = request.user
        
        # Get or create progress record
        progress, created = UserActivityProgress.objects.get_or_create(
            user=user,
            activity=activity,
            defaults={
                'is_completed': True,
                'time_spent': request.data.get('time_spent', 0),
                'user_response': request.data.get('user_response', None),
                'score': request.data.get('score', None)
            }
        )
        
        if not created:
            # Update existing progress
            progress.is_completed = True
            if 'time_spent' in request.data:
                progress.time_spent = request.data['time_spent']
            if 'user_response' in request.data:
                progress.user_response = request.data['user_response']
            if 'score' in request.data:
                progress.score = request.data['score']
            progress.save()
        
        # Award XP if this is first time completing
        if created:
            profile = user.profile
            level, xp = profile.add_xp(activity.xp_reward)
            
            # Update course progress
            self._update_course_progress(user, activity)
            
            return Response({
                'message': 'Activity completed',
                'xp_earned': activity.xp_reward,
                'current_level': level,
                'current_xp': xp
            }, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Activity progress updated'}, status=status.HTTP_200_OK)
    
    def _update_course_progress(self, user, activity):
        """Update the user's course progress based on completed activities"""
        lesson = activity.lesson
        module = lesson.module
        course = module.course
        
        # Get course progress
        course_progress, _ = UserCourseProgress.objects.get_or_create(
            user=user,
            course=course
        )
        
        # Calculate total activities in course
        total_activities = Activity.objects.filter(lesson__module__course=course).count()
        if total_activities == 0:
            return  # Avoid division by zero
        
        # Calculate completed activities
        completed_activities = UserActivityProgress.objects.filter(
            user=user,
            activity__lesson__module__course=course,
            is_completed=True
        ).count()
        
        # Update progress percentage
        progress_percentage = int((completed_activities / total_activities) * 100)
        course_progress.progress_percentage = min(progress_percentage, 100)  # Ensure not over 100%
        
        # Mark as completed if 100%
        if course_progress.progress_percentage == 100 and not course_progress.is_completed:
            course_progress.is_completed = True
            
            # Update user profile stats
            profile = user.profile
            profile.total_courses_completed += 1
            profile.save()
            
            # Create certificate if course is completed
            Certificate.objects.get_or_create(
                user=user,
                course=course
            )
        
        course_progress.save()


class UserCourseProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserCourseProgress model"""
    serializer_class = UserCourseProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return progress for the current user"""
        return UserCourseProgress.objects.filter(user=self.request.user)


class UserActivityProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserActivityProgress model"""
    serializer_class = UserActivityProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return progress for the current user"""
        return UserActivityProgress.objects.filter(user=self.request.user)


class UserDashboardView(generics.RetrieveAPIView):
    """View for user dashboard stats"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        profile = user.profile
        
        # Get courses in progress
        courses_in_progress = UserCourseProgress.objects.filter(
            user=user,
            is_completed=False,
            progress_percentage__gt=0
        ).count()
        
        # Get recent activity (completed in last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_activities = UserActivityProgress.objects.filter(
            user=user,
            is_completed=True,
            updated_at__gte=thirty_days_ago
        ).count()
        
        # Get user achievements
        achievements = UserAchievement.objects.filter(user=user).count()
        
        # Get certificates
        certificates = Certificate.objects.filter(user=user).count()
        
        # Get total learning time
        total_time = UserActivityProgress.objects.filter(
            user=user,
            is_completed=True
        ).aggregate(total_time=Sum('time_spent'))['total_time'] or 0
        
        # Convert seconds to minutes for the profile
        total_time_minutes = total_time // 60
        profile.total_learning_time = total_time_minutes
        profile.save()
        
        return Response({
            'username': user.username,
            'level': profile.level,
            'xp': profile.xp,
            'next_level_xp': profile.calculate_xp_for_next_level(),
            'days_streak': profile.days_streak,
            'courses_completed': profile.total_courses_completed,
            'courses_in_progress': courses_in_progress,
            'lessons_completed': profile.total_lessons_completed,
            'total_learning_time': profile.total_learning_time,
            'recent_activities': recent_activities,
            'achievements': achievements,
            'certificates': certificates,
        })


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Achievement model"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]


class UserAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserAchievement model"""
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return achievements for the current user"""
        return UserAchievement.objects.filter(user=self.request.user)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Certificate model"""
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return certificates for the current user"""
        return Certificate.objects.filter(user=self.request.user)
