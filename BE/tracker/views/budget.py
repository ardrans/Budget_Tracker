from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tracker.models.transactions import Transaction
from tracker.models.budget import Budget
from tracker.serializers.budget import BudgetSerializer
from django.db.models import Sum
from datetime import date
from tracker.logger import get_logger

logger = get_logger(__name__)


class MonthlyBudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            today = date.today()
            current_month_start = today.replace(day=1)

            logger.info(f"User {user.email} requested monthly budget summary for {today.strftime('%B %Y')}")

            # Transactions for current month
            transactions = Transaction.objects.filter(
                user=user,
                created_at__year=today.year,
                created_at__month=today.month
            )

            total_income = transactions.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
            total_expense = transactions.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
            balance = total_income - total_expense

            # Category-wise expense summary
            category_summary = transactions.filter(type='expense').values('category__name').annotate(total=Sum('amount'))
            category_summary = [
                {"category": x['category__name'], "total": x['total']} for x in category_summary
            ]

            # User's monthly budget
            budget = Budget.objects.filter(user=user, month=current_month_start).first()
            budget_amount = budget.amount if budget else 0

            data = {
                "month": today.strftime("%B"),
                "total_income": total_income,
                "total_expense": total_expense,
                "balance": balance,
                "budget": budget_amount,
                "remaining_budget": budget_amount - total_expense,
                "category_summary": category_summary
            }

            logger.info(f"Monthly summary generated for user {user.email}: Income={total_income}, Expense={total_expense}")
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error generating monthly summary for user {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Unable to fetch monthly summary at the moment. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BudgetCreateUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            user = self.request.user
            today = date.today()
            logger.info(f"Fetching or creating budget entry for user {user.email} for {today.strftime('%B %Y')}")

            budget, created = Budget.objects.get_or_create(
                user=user,
                month=today.replace(day=1),
                defaults={'amount': 0}
            )

            if created:
                logger.info(f"New budget created for user {user.email}")
            else:
                logger.info(f"Existing budget retrieved for user {user.email}")

            return budget

        except Exception as e:
            logger.error(f"Error retrieving or creating budget for user {self.request.user.email}: {e}", exc_info=True)
            raise

    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"User {request.user.email} updated budget to {response.data.get('amount')}")
            return Response({"message": "Budget updated successfully", "data": response.data})
        except Exception as e:
            logger.error(f"Error updating budget for user {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update budget. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )
