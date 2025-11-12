from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tracker.models.transactions import Transaction
from django.db.models import Sum
from datetime import datetime
from tracker.models.category import Category

class MonthlyBudgetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = datetime.today()
        current_month = today.month
        current_year = today.year

        transactions = Transaction.objects.filter(
            user=user,
            created_at__year=current_year,
            created_at__month=current_month
        )

        total_income = transactions.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
        total_expense = transactions.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
        balance = total_income - total_expense

        # Optional: Get category-wise summary for D3.js chart
        category_summary = transactions.filter(type='expense').values('category__name').annotate(total=Sum('amount'))

        data = {
            "month": today.strftime("%B"),
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "category_summary": list(category_summary)
        }

        return Response(data)
