from rest_framework import generics,status
from tracker.models.users import User
from rest_framework.response import Response
from tracker.serializers.users import UserSerializer
from tracker.logger import get_logger

logger = get_logger(__name__)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Received request to create user with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            logger.info(f"User created successfully with email: {serializer.data.get('email')}")
            return Response(
                {"message": "User created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"Error creating user: {e}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred while creating the user. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )
