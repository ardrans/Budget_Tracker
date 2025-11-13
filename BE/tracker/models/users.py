from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
from tracker.logger import get_logger

logger = get_logger(__name__)  

DEFAULT_CATEGORIES = ['Salary', 'Rent', 'Groceries', 'Entertainment', 'Misc']

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    email = models.EmailField(unique=True, max_length=50)
    name = models.TextField()
    phone = models.BigIntegerField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone']

    def save(self, *args, **kwargs):
        logger.info(f"Saving user: {self.email}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
    
@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        from tracker.models.category import Category
        for cat in DEFAULT_CATEGORIES:
            Category.objects.create(user=instance, name=cat, is_custom=False)