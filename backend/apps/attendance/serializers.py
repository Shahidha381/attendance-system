from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):

    timeIn = serializers.SerializerMethodField()
    timeOut = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id',
            'date',
            'timeIn',
            'timeOut',
            'status',
            'confidence',
        ]

    def get_timeIn(self, obj):
        return obj.time_in.strftime("%I:%M %p") if obj.time_in else "-"

    def get_timeOut(self, obj):
        return obj.time_out.strftime("%I:%M %p") if obj.time_out else "-"