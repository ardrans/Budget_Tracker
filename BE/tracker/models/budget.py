from django.db import models
from tracker.models.users import User
from tracker.logger import get_logger

logger = get_logger(__name__)

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    month = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'month') 

    def __str__(self):
        return f"{self.user.email} - {self.month.strftime('%B')} - {self.amount}"
    
    def save(self, *args, **kwargs):
        if self.pk:
            logger.info(f"Updating budget for user {self.user.email} for month {self.month.strftime('%B')} with amount {self.amount}")
        else:
            logger.info(f"Creating new budget for user {self.user.email} for month {self.month.strftime('%B')} with amount {self.amount}")
        super().save(*args, **kwargs)
