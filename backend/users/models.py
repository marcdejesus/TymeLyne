from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        USER = 'USER', _('User')
        PREMIUM = 'PREMIUM', _('Premium User')

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.USER
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text=_('User profile picture')
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        help_text=_('User biography')
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text=_('User date of birth')
    )
    supabase_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text=_('Supabase user ID')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']

    def __str__(self):
        return self.email or self.username

    @property
    def is_admin(self):
        return self.role == self.Roles.ADMIN

    @property
    def is_premium(self):
        return self.role == self.Roles.PREMIUM 