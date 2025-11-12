from rest_framework import serializers
from tracker.models.transactions import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'category', 'note', 'amount', 'type', 'created_at', 'updated_at', 'deleted_at']
