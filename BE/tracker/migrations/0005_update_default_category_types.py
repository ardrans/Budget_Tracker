# Generated manually to update existing default categories with correct types

from django.db import migrations


def update_default_category_types(apps, schema_editor):
    Category = apps.get_model('tracker', 'Category')
    
    # Update existing default categories to have correct types
    # Salary should be income, others should be expense
    Category.objects.filter(name='Salary', is_custom=False).update(type='income')
    Category.objects.filter(name__in=['Rent', 'Groceries', 'Entertainment', 'Misc'], is_custom=False).update(type='expense')


def reverse_update(apps, schema_editor):
    # Reverse: set all to expense (default)
    Category = apps.get_model('tracker', 'Category')
    Category.objects.filter(is_custom=False).update(type='expense')


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0004_add_category_type'),
    ]

    operations = [
        migrations.RunPython(update_default_category_types, reverse_update),
    ]

