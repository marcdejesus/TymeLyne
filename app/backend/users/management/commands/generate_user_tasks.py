from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User, UserCourseProgress, UserActivityProgress, Task
import random

class Command(BaseCommand):
    help = 'Generates tasks for users based on their course progress'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username to generate tasks for (if not specified, generates for all users)')
        parser.add_argument('--count', type=int, default=5, help='Number of tasks to generate per user')

    def handle(self, *args, **options):
        username = options.get('username')
        task_count = options.get('count', 5)
        
        # Get users
        if username:
            try:
                users = [User.objects.get(username=username)]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with username {username} does not exist'))
                return
        else:
            users = User.objects.all()
        
        total_tasks_created = 0
        
        for user in users:
            # Get user's course progress
            course_progress_list = UserCourseProgress.objects.filter(user=user)
            
            # If the user hasn't started any courses, create tasks to encourage enrollment
            if not course_progress_list.exists():
                self._create_enrollment_tasks(user, task_count)
                continue
            
            # Generate tasks based on in-progress courses
            tasks_created = self._generate_course_based_tasks(user, course_progress_list, task_count)
            total_tasks_created += tasks_created
            
            self.stdout.write(
                self.style.SUCCESS(f'Created {tasks_created} tasks for user {user.username}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created a total of {total_tasks_created} tasks')
        )
    
    def _create_enrollment_tasks(self, user, count):
        """Create tasks for a user who hasn't enrolled in any courses yet"""
        # Clear existing tasks for this user
        Task.objects.filter(user=user).delete()
        
        # Create welcome and enrollment tasks
        tasks = [
            {
                'title': 'Welcome to Tymelyne!',
                'description': 'Welcome to your learning journey. Complete your profile to get started.',
                'task_type': 'onboarding',
                'priority': 'high',
                'due_date': timezone.now() + timezone.timedelta(days=1),
                'xp_reward': 50,
                'status': 'pending'
            },
            {
                'title': 'Choose Your First Course',
                'description': 'Explore the course catalog and enroll in your first course.',
                'task_type': 'course',
                'priority': 'high',
                'due_date': timezone.now() + timezone.timedelta(days=2),
                'xp_reward': 100,
                'status': 'pending'
            },
            {
                'title': 'Complete Your Profile',
                'description': 'Add a profile picture and bio to personalize your account.',
                'task_type': 'profile',
                'priority': 'medium',
                'due_date': timezone.now() + timezone.timedelta(days=3),
                'xp_reward': 50,
                'status': 'pending'
            }
        ]
        
        created_count = 0
        for task_data in tasks[:count]:
            Task.objects.create(user=user, **task_data)
            created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} onboarding tasks for new user {user.username}')
        )
        return created_count
    
    def _generate_course_based_tasks(self, user, course_progress_list, count):
        """Generate tasks based on user's course progress"""
        # Delete previous automatically generated tasks
        Task.objects.filter(user=user, task_type__in=['course', 'lesson', 'activity']).delete()
        
        tasks_created = 0
        
        # Get in-progress courses (not completed)
        in_progress_courses = course_progress_list.filter(is_completed=False)
        
        if in_progress_courses:
            # Get the most recently updated course progress
            recent_progress = in_progress_courses.order_by('-updated_at').first()
            course = recent_progress.course
            
            # Find incomplete activities
            incomplete_activities = []
            
            for module in course.modules.all().order_by('order'):
                for lesson in module.lessons.all().order_by('order'):
                    for activity in lesson.activities.all().order_by('order'):
                        # Check if activity is completed
                        activity_progress = UserActivityProgress.objects.filter(
                            user=user, activity=activity
                        ).first()
                        
                        if not activity_progress or not activity_progress.is_completed:
                            incomplete_activities.append({
                                'activity': activity,
                                'lesson': lesson,
                                'module': module
                            })
            
            # If there are incomplete activities, create tasks for them
            if incomplete_activities:
                # Create a task for the next few activities
                for i, incomplete in enumerate(incomplete_activities[:min(count-tasks_created, 3)]):
                    activity = incomplete['activity']
                    lesson = incomplete['lesson']
                    
                    # Create task
                    Task.objects.create(
                        user=user,
                        title=f"Complete '{activity.title}'",
                        description=f"Continue your progress in {course.title}: {lesson.title} - {activity.title}",
                        task_type='activity',
                        priority='medium',
                        due_date=timezone.now() + timezone.timedelta(days=i+1),
                        xp_reward=activity.xp_reward,
                        status='pending',
                        related_object_id=activity.id,
                        related_object_type='activity'
                    )
                    tasks_created += 1
                
                # Create a task to continue the course
                if tasks_created < count:
                    Task.objects.create(
                        user=user,
                        title=f"Continue {course.title}",
                        description=f"Keep your learning momentum going in {course.title}. You're {recent_progress.progress_percentage}% complete!",
                        task_type='course',
                        priority='high',
                        due_date=timezone.now() + timezone.timedelta(days=1),
                        xp_reward=50,
                        status='pending',
                        related_object_id=course.id,
                        related_object_type='course'
                    )
                    tasks_created += 1
            
            # Create task to start a new course if needed
            if tasks_created < count:
                Task.objects.create(
                    user=user,
                    title="Explore More Courses",
                    description="Discover new courses to expand your knowledge.",
                    task_type='course',
                    priority='low',
                    due_date=timezone.now() + timezone.timedelta(days=7),
                    xp_reward=30,
                    status='pending'
                )
                tasks_created += 1
        
        # Create daily goals task
        if tasks_created < count:
            Task.objects.create(
                user=user,
                title="Set Daily Learning Goals",
                description="Aim to complete at least one activity each day to build a learning habit.",
                task_type='goal',
                priority='medium',
                due_date=timezone.now() + timezone.timedelta(days=1),
                xp_reward=20,
                status='pending'
            )
            tasks_created += 1
        
        # Create a streak maintenance task if they have a streak
        streak_days = user.profile.days_streak
        if streak_days > 0 and tasks_created < count:
            Task.objects.create(
                user=user,
                title=f"Maintain Your {streak_days}-Day Streak",
                description="Complete an activity today to maintain your learning streak!",
                task_type='streak',
                priority='high',
                due_date=timezone.now().replace(hour=23, minute=59, second=59),
                xp_reward=10 * min(streak_days, 10),  # Cap at 100 XP
                status='pending'
            )
            tasks_created += 1
        
        return tasks_created 