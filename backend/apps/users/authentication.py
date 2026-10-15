# apps/users/authentication.py
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import User
from .token_utils import decode_access_token


class UUIDJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired — please login again")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {str(e)}")

        user_uuid = payload.get("user_uuid")
        if not user_uuid:
            raise AuthenticationFailed("Token missing user identity")

        try:
            user = User.objects.get(id=user_uuid)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")

        return (user, token)