# apps/users/token_utils.py
import jwt
from datetime import datetime, timedelta
from django.conf import settings

def generate_tokens(user):
    """Generate JWT tokens manually for a plain models.Model user."""

    now = datetime.utcnow()

    access_payload = {
        "user_uuid": str(user.id),        # UUID pk
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "user_id": user.user_id,          # student/teacher ID
        "exp": now + timedelta(days=1),
        "iat": now,
        "type": "access",
    }

    refresh_payload = {
        "user_uuid": str(user.id),
        "exp": now + timedelta(days=7),
        "iat": now,
        "type": "refresh",
    }

    access_token = jwt.encode(
        access_payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    refresh_token = jwt.encode(
        refresh_payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    return {
        "access": access_token,
        "refresh": refresh_token,
    }


def decode_access_token(token):
    """Decode and validate an access token. Returns payload or raises."""
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=["HS256"]
    )
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Not an access token")
    return payload