from django.urls import path
from tracker.views.users import UserListCreateView
from tracker.views.category import CategoryListCreateView, CategoryDetailView
from tracker.views.transactions import TransactionListCreateView, TransactionDetailView
from tracker.views.budget import MonthlyBudgetSummaryView,BudgetCreateUpdateView
from tracker.views.auth import LoginView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('budget/', BudgetCreateUpdateView.as_view(), name='budget-create-update'),
    path('budget/monthly/', MonthlyBudgetSummaryView.as_view(), name='monthly-budget-summary'),
    path('login/', LoginView.as_view(), name='login'), 
]
