from rest_framework import generics
from tracker.models.users import User
from tracker.serializers.users import UserSerializer

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
