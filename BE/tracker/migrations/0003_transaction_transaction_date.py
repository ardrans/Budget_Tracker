# Generated manually for adding transaction_date field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0002_alter_category_is_custom_budget'),
    ]

    operations = [
        # Step 1: Add the column if it doesn't exist (using raw SQL to handle existing column)
        migrations.RunSQL(
            sql="""
                SET @col_exists = (
                    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'tracker_transaction'
                    AND COLUMN_NAME = 'transaction_date'
                );
                
                SET @sql_query = IF(@col_exists = 0,
                    'ALTER TABLE tracker_transaction ADD COLUMN transaction_date DATE NULL',
                    'SELECT 1 as dummy'
                );
                
                PREPARE stmt FROM @sql_query;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            """,
            reverse_sql="ALTER TABLE tracker_transaction DROP COLUMN IF EXISTS transaction_date",
        ),
        # Step 2: Populate existing rows with created_at date
        migrations.RunSQL(
            sql="""
                UPDATE tracker_transaction
                SET transaction_date = DATE(created_at)
                WHERE transaction_date IS NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
        # Step 3: Make field non-nullable (state operation only since column already exists)
        # We need to use SeparateDatabaseAndState to only update state
        migrations.SeparateDatabaseAndState(
            database_operations=[
                # Column already exists from RunSQL, just make it non-nullable
                migrations.RunSQL(
                    sql="ALTER TABLE tracker_transaction MODIFY COLUMN transaction_date DATE NOT NULL;",
                    reverse_sql="ALTER TABLE tracker_transaction MODIFY COLUMN transaction_date DATE NULL;",
                ),
            ],
            state_operations=[
                # Update Django model state
                migrations.AddField(
                    model_name='transaction',
                    name='transaction_date',
                    field=models.DateField(),
                ),
            ],
        ),
    ]

