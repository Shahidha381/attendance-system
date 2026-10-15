import uuid
from django.db import models


class User(models.Model):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("teacher", "Teacher"),
    )

    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name     = models.CharField(max_length=255)
    email    = models.EmailField(unique=True)
    role     = models.CharField(max_length=10, choices=ROLE_CHOICES)
    user_id  = models.CharField(max_length=100)
    face_image    = models.ImageField(upload_to="faces/")
    face_encoding = models.JSONField(null=True, blank=True)
    password = models.CharField(max_length=255)

    # ← ADD THESE THREE — required by DRF's IsAuthenticated permission
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_active(self):
        return True

    def __str__(self):
        return self.email