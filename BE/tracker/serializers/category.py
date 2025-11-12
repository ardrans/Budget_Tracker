from rest_framework import serializers
from tracker.models.category import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'created_at', 'is_custom']
        read_only_fields = ['user', 'created_at', 'is_custom']

    def create(self, validated_data):
        # When user creates a category, mark it as custom
        validated_data['is_custom'] = True
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
