from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from tracker.models.users import User
from rest_framework.permissions import AllowAny

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email_or_phone = request.data.get('email') or request.data.get('phone')
        password = request.data.get('password')

        if not email_or_phone or not password:
            return Response({"error": "Email/Phone and password required"}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        try:
            if '@' in email_or_phone:
                user = authenticate(request, username=email_or_phone, password=password)
            else:
                user_obj = User.objects.get(phone=email_or_phone)
                user = authenticate(request, username=user_obj.email, password=password)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {"email": user.email, "name": user.name, "phone": user.phone}
        })
