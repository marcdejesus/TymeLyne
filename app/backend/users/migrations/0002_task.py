# Generated by Django 4.2.10 on 2025-04-08 02:38

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('task_type', models.CharField(choices=[('course', 'Course Related'), ('lesson', 'Lesson Related'), ('activity', 'Activity Related'), ('profile', 'Profile Related'), ('streak', 'Streak Related'), ('goal', 'Goal Related'), ('onboarding', 'Onboarding'), ('other', 'Other')], default='other', max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium', max_length=10)),
                ('due_date', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('skipped', 'Skipped')], default='pending', max_length=20)),
                ('xp_reward', models.PositiveIntegerField(default=10)),
                ('related_object_id', models.UUIDField(blank=True, null=True)),
                ('related_object_type', models.CharField(blank=True, max_length=20, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-priority', 'due_date', '-created_at'],
            },
        ),
    ]
