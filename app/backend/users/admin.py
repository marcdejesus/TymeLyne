from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (
    User, UserProfile, Course, Module, Lesson, Activity, 
    UserCourseProgress, UserActivityProgress, Achievement, 
    UserAchievement, Certificate
)

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

admin.site.register(User, UserAdmin)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'difficulty', 'is_ai_generated', 'creator', 'created_at')
    list_filter = ('is_ai_generated', 'difficulty', 'category', 'created_at')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('id',)

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'description')
    readonly_fields = ('id',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order')
    list_filter = ('module__course', 'module')
    search_fields = ('title', 'content')
    readonly_fields = ('id',)

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'activity_type', 'order', 'xp_reward')
    list_filter = ('activity_type', 'lesson__module__course')
    search_fields = ('title', 'description', 'content')
    readonly_fields = ('id',)

@admin.register(UserCourseProgress)
class UserCourseProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percentage', 'is_completed', 'last_accessed')
    list_filter = ('is_completed', 'course')
    search_fields = ('user__username', 'course__title')

@admin.register(UserActivityProgress)
class UserActivityProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity', 'is_completed', 'score', 'time_spent')
    list_filter = ('is_completed', 'activity__activity_type')
    search_fields = ('user__username', 'activity__title')

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'xp_reward')
    list_filter = ('category',)
    search_fields = ('name', 'description')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'earned_at')
    list_filter = ('achievement__category', 'earned_at')
    search_fields = ('user__username', 'achievement__name')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'issue_date', 'certificate_id')
    list_filter = ('issue_date',)
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('certificate_id',)
