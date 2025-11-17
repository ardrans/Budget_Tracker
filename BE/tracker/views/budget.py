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
            # Get month and year from query parameters, default to current month
            year = request.query_params.get('year', None)
            month = request.query_params.get('month', None)
            
            if year and month:
                try:
                    year = int(year)
                    month = int(month)
                    selected_date = date(year, month, 1)
                except (ValueError, TypeError):
                    today = date.today()
                    selected_date = today.replace(day=1)
            else:
                today = date.today()
                selected_date = today.replace(day=1)

            logger.info(f"User {user.email} requested monthly budget summary for {selected_date.strftime('%B %Y')}")

            # Transactions for selected month
            transactions = Transaction.objects.filter(
                user=user,
                created_at__year=selected_date.year,
                created_at__month=selected_date.month
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
            month_start = selected_date.replace(day=1)
            budget = Budget.objects.filter(user=user, month=month_start).first()
            budget_amount = budget.amount if budget else 0

            data = {
                "month": selected_date.strftime("%B"),
                "year": selected_date.year,
                "month_number": selected_date.month,
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
            # Get month and year from query parameters or request data, default to current month
            year = self.request.query_params.get('year') or (self.request.data.get('year') if hasattr(self.request, 'data') else None)
            month = self.request.query_params.get('month') or (self.request.data.get('month') if hasattr(self.request, 'data') else None)
            
            if year and month:
                try:
                    year = int(year)
                    month = int(month)
                    selected_date = date(year, month, 1)
                except (ValueError, TypeError):
                    today = date.today()
                    selected_date = today.replace(day=1)
            else:
                today = date.today()
                selected_date = today.replace(day=1)
            
            logger.info(f"Fetching or creating budget entry for user {user.email} for {selected_date.strftime('%B %Y')}")

            budget, created = Budget.objects.get_or_create(
                user=user,
                month=selected_date.replace(day=1),
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
            # Get the budget object first (this handles month/year from query params)
            budget = self.get_object()
            
            # Only update the amount field, ignore month if sent in request data
            serializer = self.get_serializer(budget, data={'amount': request.data.get('amount')}, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            logger.info(f"User {request.user.email} updated budget to {serializer.data.get('amount')}")
            return Response({"message": "Budget updated successfully", "data": serializer.data})
        except Exception as e:
            logger.error(f"Error updating budget for user {request.user.email}: {e}", exc_info=True)
            return Response(
                {"error": "Failed to update budget. Please try again later."},
                status=status.HTTP_400_BAD_REQUEST
            )
