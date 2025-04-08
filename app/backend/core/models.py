from django.db import models

# Create your models here.

class Task(models.Model):
    """
    A simple task model for demonstration purposes
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        """Return a string representation of the task"""
        return self.title
