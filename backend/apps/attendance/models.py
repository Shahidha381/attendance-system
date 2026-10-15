import uuid
from django.db import models
from apps.users.models import User


class Attendance(models.Model):

    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='attendances'
    )

    date = models.DateField()

    time = models.TimeField()

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Present')

    face_match_confidence = models.FloatField(default=0.0)

    class Meta:
        unique_together = (('student', 'date'),)

    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"