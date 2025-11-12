from rest_framework import serializers
from tracker.models.category import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'is_custom','created_at', 'updated_at', 'deleted_at']
