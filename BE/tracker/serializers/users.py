from rest_framework import serializers
from tracker.models.users import User
from tracker.logger import get_logger

logger = get_logger(__name__)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'password','currency']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        try:
            logger.info(f"Attempting to create user with email: {validated_data.get('email')}")
            user = User.objects.create_user(**validated_data)
            logger.info(f"User created successfully with ID: {user.id} and email: {user.email}")
            return user
        except Exception as e:
            logger.error(f"Error creating user: {e}", exc_info=True)
            raise e