from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import json

class User(AbstractUser):
    """
    Custom User model that extends the built-in Django User model
    """
    email = models.EmailField(_('email address'), unique=True)
    
    # Required fields for authentication
    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        
    def __str__(self):
        return self.username


class UserProfile(models.Model):
    """
    Extended user profile with learning and achievement information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # XP and Level tracking
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    days_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(auto_now_add=True)
    
    # Preferences
    theme_preference = models.CharField(
        max_length=20, 
        choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        default='system'
    )
    accent_color = models.CharField(max_length=20, default='#FF9500')
    
    # Stats
    total_courses_completed = models.PositiveIntegerField(default=0)
    total_lessons_completed = models.PositiveIntegerField(default=0)
    total_learning_time = models.PositiveIntegerField(default=0)  # in minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
    
    def calculate_xp_for_next_level(self):
        """Calculate XP needed for the next level"""
        return self.level * 100
    
    def add_xp(self, amount):
        """Add XP and handle level-up if applicable"""
        self.xp += amount
        xp_for_next_level = self.calculate_xp_for_next_level()
        
        # Level up if enough XP
        while self.xp >= xp_for_next_level:
            self.xp -= xp_for_next_level
            self.level += 1
            xp_for_next_level = self.calculate_xp_for_next_level()
            
        self.save()
        return self.level, self.xp


class Course(models.Model):
    """
    Course model for storing both built-in and AI-generated courses
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='course_images/', blank=True, null=True)
    
    # Course properties
    is_ai_generated = models.BooleanField(default=False)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_courses')
    category = models.CharField(max_length=100, blank=True, null=True)
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('all_levels', 'All Levels')
        ],
        default='beginner'
    )
    estimated_duration = models.CharField(max_length=50, blank=True, null=True)  # e.g., "4 weeks"
    
    # For AI-generated courses
    prompt_data = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class Module(models.Model):
    """
    Module model for course modules
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """
    Lesson model for module lessons
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.module.title} - {self.title}"


class ActivityType(models.TextChoices):
    READING = 'reading', _('Reading')
    QUIZ = 'quiz', _('Quiz')
    PRACTICE = 'practice', _('Practice')
    WRITING = 'writing', _('Writing')
    CHALLENGE = 'challenge', _('Challenge')
    REFLECTION = 'reflection', _('Reflection')
    CONCEPT_CHECK = 'concept_check', _('Concept Check')
    MATCHING = 'matching', _('Matching')


class Activity(models.Model):
    """
    Activity model for lesson activities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    activity_type = models.CharField(
        max_length=20,
        choices=ActivityType.choices,
        default=ActivityType.READING
    )
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)
    xp_reward = models.PositiveIntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = 'activities'
        
    def __str__(self):
        return f"{self.lesson.title} - {self.title} ({self.activity_type})"


class UserCourseProgress(models.Model):
    """
    Track user progress in courses
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='user_progress')
    progress_percentage = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'course')
        
    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.progress_percentage}%"


class UserActivityProgress(models.Model):
    """
    Track user progress in activities
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_progress')
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='user_progress')
    is_completed = models.BooleanField(default=False)
    user_response = models.JSONField(blank=True, null=True)  # Store responses for quizzes, challenges, etc.
    score = models.FloatField(blank=True, null=True)  # For activities with scoring
    time_spent = models.PositiveIntegerField(default=0, help_text="Time spent in seconds")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'activity')
        
    def __str__(self):
        return f"{self.user.username} - {self.activity.title} - {'Completed' if self.is_completed else 'In Progress'}"


class Achievement(models.Model):
    """
    Achievement model for user achievements
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Ionicon name for the achievement")
    xp_reward = models.PositiveIntegerField(default=50)
    
    CATEGORY_CHOICES = [
        ('learning', 'Learning'),
        ('performance', 'Performance'),
        ('streak', 'Streak'),
        ('social', 'Social'),
        ('special', 'Special'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='learning')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """
    Track achievements earned by users
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='users')
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'achievement')
        
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class Certificate(models.Model):
    """
    Certificate model for completed courses
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    issue_date = models.DateTimeField(auto_now_add=True)
    certificate_id = models.UUIDField(default=uuid.uuid4, editable=False)
    
    class Meta:
        unique_together = ('user', 'course')
        
    def __str__(self):
        return f"{self.user.username} - {self.course.title} Certificate"
