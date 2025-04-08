from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User, Achievement, UserAchievement
import random

class Command(BaseCommand):
    help = 'Assigns random achievements to a specified user for testing'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username to assign achievements to')
        parser.add_argument('--completed', type=int, default=5, help='Number of completed achievements to assign')
        parser.add_argument('--in-progress', type=int, default=5, help='Number of in-progress achievements to assign')

    def handle(self, *args, **options):
        username = options.get('username')
        completed_count = options.get('completed', 5)
        in_progress_count = options.get('in-progress', 5)
        
        # Get all users if username not specified
        if username:
            try:
                users = [User.objects.get(username=username)]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with username {username} does not exist'))
                return
        else:
            users = User.objects.all()
        
        # Get all achievements
        achievements = list(Achievement.objects.all())
        if not achievements:
            self.stdout.write(self.style.ERROR('No achievements found in database'))
            return
        
        for user in users:
            # Shuffle achievements for randomness
            random.shuffle(achievements)
            
            # Assign completed achievements
            for i in range(min(completed_count, len(achievements))):
                achievement = achievements[i]
                UserAchievement.objects.update_or_create(
                    user=user,
                    achievement=achievement,
                    defaults={
                        'earned_at': timezone.now() - timezone.timedelta(days=random.randint(1, 30))
                    }
                )
            
            # Assign in-progress achievements (no earned_at date)
            start_idx = completed_count
            for i in range(start_idx, min(start_idx + in_progress_count, len(achievements))):
                achievement = achievements[i]
                UserAchievement.objects.update_or_create(
                    user=user,
                    achievement=achievement,
                    defaults={
                        'earned_at': None
                    }
                )
            
            # Get counts for confirmation
            user_completed = UserAchievement.objects.filter(
                user=user, 
                earned_at__isnull=False
            ).count()
            
            user_in_progress = UserAchievement.objects.filter(
                user=user, 
                earned_at__isnull=True
            ).count()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully assigned {user_completed} completed and {user_in_progress} in-progress '
                    f'achievements to user {user.username}'
                )
            ) 