from django.core.management.base import BaseCommand
from users.models import Achievement

class Command(BaseCommand):
    help = 'Creates 20 predefined achievements in the database'

    def handle(self, *args, **options):
        # Define achievements
        achievements = [
            # Learning journey achievements
            {
                'name': 'First Timer',
                'description': 'Complete your first lesson',
                'icon': 'school',
                'category': 'Learning Journey',
                'xp_reward': 50,
            },
            {
                'name': 'Getting Started',
                'description': 'Complete your first course',
                'icon': 'rocket',
                'category': 'Learning Journey',
                'xp_reward': 100,
            },
            {
                'name': 'Knowledge Seeker',
                'description': 'Complete 5 different courses',
                'icon': 'book',
                'category': 'Learning Journey',
                'xp_reward': 250,
            },
            {
                'name': 'Academic Master',
                'description': 'Complete 10 different courses',
                'icon': 'school-outline',
                'category': 'Learning Journey',
                'xp_reward': 500,
            },
            
            # Consistency achievements
            {
                'name': 'Streak Starter',
                'description': 'Complete lessons for 3 consecutive days',
                'icon': 'flame',
                'category': 'Consistency',
                'xp_reward': 100,
            },
            {
                'name': 'Streak Master',
                'description': 'Complete lessons for 7 consecutive days',
                'icon': 'flame-outline',
                'category': 'Consistency',
                'xp_reward': 200,
            },
            {
                'name': 'Dedicated Learner',
                'description': 'Complete lessons for 30 consecutive days',
                'icon': 'calendar',
                'category': 'Consistency',
                'xp_reward': 500,
            },
            
            # Mastery achievements
            {
                'name': 'Perfect Score',
                'description': 'Score 100% on a quiz',
                'icon': 'ribbon',
                'category': 'Mastery',
                'xp_reward': 150,
            },
            {
                'name': 'Quiz Champion',
                'description': 'Score 100% on 5 different quizzes',
                'icon': 'ribbon-outline',
                'category': 'Mastery',
                'xp_reward': 300,
            },
            {
                'name': 'Fast Learner',
                'description': 'Complete an activity in less than 2 minutes with a perfect score',
                'icon': 'speedometer',
                'category': 'Mastery',
                'xp_reward': 200,
            },
            
            # Time-based achievements
            {
                'name': 'Early Bird',
                'description': 'Complete a lesson before 8 AM',
                'icon': 'sunny',
                'category': 'Time Management',
                'xp_reward': 100,
            },
            {
                'name': 'Night Owl',
                'description': 'Complete a lesson after 10 PM',
                'icon': 'moon',
                'category': 'Time Management',
                'xp_reward': 100,
            },
            {
                'name': 'Weekend Warrior',
                'description': 'Complete 5 lessons on a weekend',
                'icon': 'today',
                'category': 'Time Management',
                'xp_reward': 150,
            },
            
            # Community achievements
            {
                'name': 'Social Butterfly',
                'description': 'Connect with 5 friends',
                'icon': 'people',
                'category': 'Community',
                'xp_reward': 100,
            },
            {
                'name': 'Community Helper',
                'description': 'Answer 10 questions from other users',
                'icon': 'help-circle',
                'category': 'Community',
                'xp_reward': 200,
            },
            {
                'name': 'Popular Content',
                'description': 'Have one of your answers liked by 10 different users',
                'icon': 'thumbs-up',
                'category': 'Community',
                'xp_reward': 250,
            },
            
            # Level achievements
            {
                'name': 'Level 5 Reached',
                'description': 'Reach level 5 on your learning journey',
                'icon': 'star',
                'category': 'Progression',
                'xp_reward': 300,
            },
            {
                'name': 'Level 10 Reached',
                'description': 'Reach level 10 on your learning journey',
                'icon': 'star-half',
                'category': 'Progression',
                'xp_reward': 500,
            },
            {
                'name': 'Level 25 Reached',
                'description': 'Reach level 25 on your learning journey',
                'icon': 'star-outline',
                'category': 'Progression',
                'xp_reward': 1000,
            },
            {
                'name': 'Completionist',
                'description': 'Complete all activities in a course without skipping any',
                'icon': 'checkmark-done-circle',
                'category': 'Completion',
                'xp_reward': 400,
            },
        ]
        
        # Counter for created and updated achievements
        created_count = 0
        updated_count = 0
        
        # Create achievements
        for achievement_data in achievements:
            achievement, created = Achievement.objects.update_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully added {created_count} new achievements and updated {updated_count} existing achievements'
            )
        ) 