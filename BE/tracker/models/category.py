from django.db import models
from tracker.models.users import User
from tracker.logger import get_logger

logger = get_logger(__name__)

class Category(models.Model):
    TYPE_CHOICES = (
        ('income', 'Income'),
        ('expense', 'Expense')
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    is_custom = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.pk:
            logger.info(f"Updating category '{self.name}' for user {self.user.email}")
        else:
            logger.info(f"Creating new category '{self.name}' for user {self.user.email}")
        super().save(*args, **kwargs)

