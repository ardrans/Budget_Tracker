from django.db import models
from tracker.models.users import User
from tracker.models.category import Category
from tracker.logger import get_logger

logger = get_logger(__name__)

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('income', 'Income'),
        ('expense', 'Expense')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="transactions")
    note = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.amount}"
    
    def save(self, *args, **kwargs):
        if self.pk:
            logger.info(f"Updating transaction ID {self.pk} for user {self.user.email}: {self.type} - {self.amount} in category {self.category.name}")
        else:
            logger.info(f"Creating new transaction for user {self.user.email}: {self.type} - {self.amount} in category {self.category.name}")
        super().save(*args, **kwargs)

