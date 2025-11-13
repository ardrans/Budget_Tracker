from rest_framework import serializers
from tracker.models.category import Category
from tracker.logger import get_logger

logger = get_logger(__name__)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'created_at', 'is_custom']
        read_only_fields = ['user', 'created_at', 'is_custom']

    def create(self, validated_data):
        try:
            validated_data['is_custom'] = True
            validated_data['user'] = self.context['request'].user

            logger.info(f"Creating custom category '{validated_data.get('name')}' for user {validated_data['user']}")
            category = super().create(validated_data)
            logger.info(f"Category created successfully with ID: {category.id}")

            return category

        except Exception as e:
            logger.error(f"Error creating category: {e}", exc_info=True)
            raise e

