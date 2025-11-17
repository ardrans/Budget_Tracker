# Generated manually for adding transaction_date field

from django.db import migrations, models
from django.db.models.functions import TruncDate


def populate_transaction_date(apps, schema_editor):
    Transaction = apps.get_model('tracker', 'Transaction')
    Transaction.objects.filter(transaction_date__isnull=True).update(
        transaction_date=TruncDate('created_at')
    )


def reset_transaction_date(apps, schema_editor):
    Transaction = apps.get_model('tracker', 'Transaction')
    Transaction.objects.update(transaction_date=None)


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0002_alter_category_is_custom_budget'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='transaction_date',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.RunPython(
            code=populate_transaction_date,
            reverse_code=reset_transaction_date,
        ),
        migrations.AlterField(
            model_name='transaction',
            name='transaction_date',
            field=models.DateField(),
        ),
    ]

