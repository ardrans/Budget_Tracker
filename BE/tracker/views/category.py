from rest_framework import generics, permissions
from tracker.models.category import Category
from tracker.serializers.category import CategorySerializer
from rest_framework.exceptions import PermissionDenied

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only the categories for the logged-in user
        return Category.objects.filter(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow access to user's categories
        return Category.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        # Only allow updating custom categories
        if serializer.instance.is_custom:
            serializer.save()
        else:
            raise PermissionDenied("Default categories cannot be edited.")

    def perform_destroy(self, instance):
        # Only allow deleting custom categories
        if instance.is_custom:
            instance.delete()
        else:
            raise PermissionDenied("Default categories cannot be deleted.")
