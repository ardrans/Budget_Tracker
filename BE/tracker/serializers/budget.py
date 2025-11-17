from rest_framework import serializers
from tracker.models.budget import Budget
from tracker.logger import get_logger

logger = get_logger(__name__)

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'user', 'month', 'amount']
        read_only_fields = ['id', 'user', 'month']

    def validate_amount(self, value):
        if value <= 0:
            logger.warning(f"Invalid budget amount: {value}")
            raise serializers.ValidationError("Amount must be greater than zero.")
        logger.info(f"Validated budget amount: {value}")
        return value

    def create(self, validated_data):
        logger.info(f"Creating budget entry for user: {validated_data.get('user')} with data: {validated_data}")
        budget = super().create(validated_data)
        logger.info(f"Budget created successfully with ID: {budget.id}")
        return budget
