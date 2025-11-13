from rest_framework import serializers
from tracker.models.transactions import Transaction
from tracker.logger import get_logger

logger = get_logger(__name__)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'deleted_at']

    def validate_amount(self, value):
        if value <= 0:
            logger.warning("Attempted to add transaction with non-positive amount")
            raise serializers.ValidationError("Amount must be greater than zero")
        logger.info(f"Validated transaction amount: {value}")
        return value
