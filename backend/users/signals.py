# This file contains signal handlers for the users app
# For example, signals to sync user data with Supabase

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

# Example signal:
# @receiver(post_save, sender=User)
# def sync_user_to_supabase(sender, instance, created, **kwargs):
#     """Sync user data to Supabase when a user is created or updated."""
#     pass 