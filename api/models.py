from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    favorite_persona = models.CharField(max_length=20, choices=[
        ('outings', 'Outings'),
        ('travel', 'Travel'),
        ('fashion', 'Fashion'),
    ], default='outings')
    preferred_language = models.CharField(max_length=2, choices=[
        ('en', 'English'),
        ('ja', 'Japanese'),
    ], default='en')
    total_searches = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history')
    place = models.CharField(max_length=200)
    query = models.TextField()
    persona = models.CharField(max_length=20)
    language = models.CharField(max_length=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Search Histories'
    
    def __str__(self):
        return f"{self.user.username} - {self.place} ({self.created_at})"
