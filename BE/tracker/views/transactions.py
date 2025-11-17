from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from tracker.models.transactions import Transaction
from tracker.serializers.transactions import TransactionSerializer
from tracker.logger import get_logger

logger = get_logger(__name__)

# Custom pagination
class TransactionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['category', 'type', 'amount', 'transaction_date', 'created_at']
    search_fields = ['note']
    ordering_fields = ['transaction_date', 'created_at', 'amount']

    def get_queryset(self):
        try:
            queryset = Transaction.objects.filter(user=self.request.user)
            logger.info(f"User {self.request.user.email} accessed transaction list, {queryset.count()} records returned")
            return queryset
        except Exception as e:
            logger.error(f"Error fetching transactions for {self.request.user.email}: {e}", exc_info=True)
            return Transaction.objects.none()

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"User {request.user.email} attempting to create a transaction with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Transaction created successfully for user {request.user.email}")

            return Response(
                {"message": "Transaction created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"Error creating transaction for user {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create transaction. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
            logger.info(
                f"User {self.request.user.email} created a transaction of amount {serializer.instance.amount} "
                f"in category {serializer.instance.category}"
            )
        except Exception as e:
            logger.error(f"Error saving transaction for user {self.request.user.email}: {e}", exc_info=True)
            raise


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            queryset = Transaction.objects.filter(user=self.request.user)
            logger.info(f"User {self.request.user.email} accessed transaction detail view")
            return queryset
        except Exception as e:
            logger.error(f"Error fetching transaction details for {self.request.user.email}: {e}", exc_info=True)
            return Transaction.objects.none()

    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"User {request.user.email} updated transaction {self.get_object().id}")
            return Response({"message": "Transaction updated successfully", "data": response.data})
        except Exception as e:
            logger.error(f"Error updating transaction for {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update transaction. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"User {request.user.email} deleted transaction {instance.id}")
            self.perform_destroy(instance)
            return Response({"message": "Transaction deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting transaction for {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to delete transaction. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )
