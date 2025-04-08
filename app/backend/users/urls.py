from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, CustomTokenObtainPairView, UserDetailView, UserUpdateView,
    CourseViewSet, ModuleViewSet, LessonViewSet, ActivityViewSet,
    UserCourseProgressViewSet, UserActivityProgressViewSet, UserDashboardView,
    AchievementViewSet, UserAchievementViewSet, CertificateViewSet
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'progress/courses', UserCourseProgressViewSet, basename='course-progress')
router.register(r'progress/activities', UserActivityProgressViewSet, basename='activity-progress')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'user-achievements', UserAchievementViewSet, basename='user-achievement')
router.register(r'certificates', CertificateViewSet, basename='certificate')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User endpoints
    path('users/me/', UserDetailView.as_view(), name='user_detail'),
    path('users/me/update/', UserUpdateView.as_view(), name='user_update'),
    path('users/dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    
    # Include all ViewSet routes
    path('', include(router.urls)),
] 