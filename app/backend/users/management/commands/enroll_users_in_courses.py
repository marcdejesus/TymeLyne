from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User, Course, UserCourseProgress

class Command(BaseCommand):
    help = 'Enrolls users in courses for testing purposes'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username to enroll (if not specified, enrolls all users)')

    def handle(self, *args, **options):
        username = options.get('username')
        
        # Get users
        if username:
            try:
                users = [User.objects.get(username=username)]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with username {username} does not exist'))
                return
        else:
            users = User.objects.all()
        
        # Get courses
        courses = Course.objects.all()
        if not courses.exists():
            self.stdout.write(self.style.ERROR('No courses found in the database'))
            return
        
        total_enrollments = 0
        
        for user in users:
            # Enroll in first course (Python Fundamentals)
            try:
                python_course = Course.objects.get(title='Python Fundamentals')
                progress, created = UserCourseProgress.objects.get_or_create(
                    user=user,
                    course=python_course,
                    defaults={
                        'progress_percentage': 25,  # Set some initial progress
                        'is_completed': False
                    }
                )
                
                if created:
                    self.stdout.write(f"Enrolled {user.username} in {python_course.title}")
                    total_enrollments += 1
                else:
                    progress.progress_percentage = 25
                    progress.save()
                    self.stdout.write(f"Updated progress for {user.username} in {python_course.title}")
            except Course.DoesNotExist:
                self.stdout.write(self.style.WARNING("Python Fundamentals course not found"))
            
            # Optionally enroll in Web Development Basics
            if user.username in ['admin', 'superuser']:
                try:
                    web_course = Course.objects.get(title='Web Development Basics')
                    progress, created = UserCourseProgress.objects.get_or_create(
                        user=user,
                        course=web_course,
                        defaults={
                            'progress_percentage': 10,  # Set some initial progress
                            'is_completed': False
                        }
                    )
                    
                    if created:
                        self.stdout.write(f"Enrolled {user.username} in {web_course.title}")
                        total_enrollments += 1
                    else:
                        progress.progress_percentage = 10
                        progress.save()
                        self.stdout.write(f"Updated progress for {user.username} in {web_course.title}")
                except Course.DoesNotExist:
                    self.stdout.write(self.style.WARNING("Web Development Basics course not found"))
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully enrolled users in courses ({total_enrollments} total enrollments)')
        ) 