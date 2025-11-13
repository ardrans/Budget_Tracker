from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from tracker.models.category import Category
from tracker.serializers.category import CategorySerializer
from tracker.logger import get_logger

logger = get_logger(__name__)


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            queryset = Category.objects.filter(user=self.request.user)
            logger.info(f"User {self.request.user.email} accessed category list, {queryset.count()} records returned")
            return queryset
        except Exception as e:
            logger.error(f"Error fetching categories for {self.request.user.email}: {e}", exc_info=True)
            return Category.objects.none()

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user.email} attempting to create category with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Category '{serializer.data.get('name')}' created successfully for user {request.user.email}")
            return Response(
                {"message": "Category created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating category for user {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create category. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            queryset = Category.objects.filter(user=self.request.user)
            logger.info(f"User {self.request.user.email} accessed category detail view")
            return queryset
        except Exception as e:
            logger.error(f"Error fetching category details for {self.request.user.email}: {e}", exc_info=True)
            return Category.objects.none()

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if not instance.is_custom:
                logger.warning(f"User {request.user.email} attempted to edit default category {instance.id}")
                raise PermissionDenied("Default categories cannot be edited.")

            response = super().update(request, *args, **kwargs)
            logger.info(f"User {request.user.email} updated category {instance.id}")
            return Response({"message": "Category updated successfully", "data": response.data})
        except PermissionDenied as e:
            logger.warning(f"Permission denied for {request.user.email}: {e}")
            raise e
        except Exception as e:
            logger.error(f"Error updating category for {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update category. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if not instance.is_custom:
                logger.warning(f"User {request.user.email} attempted to delete default category {instance.id}")
                raise PermissionDenied("Default categories cannot be deleted.")

            logger.info(f"User {request.user.email} deleted category {instance.id}")
            self.perform_destroy(instance)
            return Response({"message": "Category deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except PermissionDenied as e:
            logger.warning(f"Permission denied for {request.user.email}: {e}")
            raise e
        except Exception as e:
            logger.error(f"Error deleting category for {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to delete category. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )
