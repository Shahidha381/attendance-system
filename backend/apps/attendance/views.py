from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

import cv2
import numpy as np

from .models import Attendance
from .face_recognition_utils import FaceRecognizer
from apps.users.models import User


# ─────────────────────────────────────────────
# MARK ATTENDANCE
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):

    try:
        face_image = request.FILES.get('face_image')

        if not face_image:
            return Response({
                'success': False,
                'message': 'No face image provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Convert image to OpenCV format
        image_bytes = face_image.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return Response({
                'success': False,
                'message': 'Could not decode image. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Run face recognition
        recognizer = FaceRecognizer()
        result = recognizer.recognize_face(img)

        if not result['success']:
            return Response({
                'success': False,
                'message': result['message']
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get matched user
        matched_user_id = result['user_id']
        try:
            matched_user = User.objects.get(id=matched_user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Recognized user not found in database.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check duplicate for today
        today = timezone.localdate()
        if Attendance.objects.filter(student=matched_user, date=today).exists():
            return Response({
                'success': False,
                'message': 'Attendance already marked for today'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Determine status (Late if after 9:30 AM)
        now_local = timezone.localtime()
        current_time = now_local.time()

        from datetime import time as dtime
        cutoff = dtime(9, 30)
        attendance_status = 'Late' if current_time > cutoff else 'Present'

        # Save attendance
        Attendance.objects.create(
            student=matched_user,
            date=today,
            time=current_time,
            status=attendance_status,
            face_match_confidence=round(result['confidence'], 2)
        )

        return Response({
            'success': True,
            'student_name': matched_user.name,
            'attendance_time': now_local.strftime('%I:%M %p'),
            'match_percentage': round(result['confidence'], 2),
            'status': attendance_status
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("MARK ATTENDANCE ERROR:", str(e))
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# REGISTER FACE
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_face(request):

    try:
        face_image = request.FILES.get('face_image')

        if not face_image:
            return Response({
                'success': False,
                'message': 'No face image provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        image_bytes = face_image.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        recognizer = FaceRecognizer()
        result = recognizer.register_face(img, user.id)

        if result['success']:
            return Response({
                'success': True,
                'message': 'Face registered successfully'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': result['message']
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("REGISTER FACE ERROR:", str(e))
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# STUDENT ATTENDANCE REPORTS
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_reports(request):
    """Returns attendance records + summary for the logged-in student."""

    try:
        user = request.user
        records_qs = Attendance.objects.filter(student=user).order_by('-date', '-time')

        total = records_qs.count()
        present = records_qs.filter(status='Present').count()
        late = records_qs.filter(status='Late').count()
        absent = records_qs.filter(status='Absent').count()
        rate = round((present / total) * 100) if total > 0 else 0

        records = []
        for r in records_qs:
            records.append({
                'id': str(r.id),
                'date': r.date.strftime('%d %b %Y'),
                'timeIn': r.time.strftime('%I:%M %p') if r.time else '-',
                'timeOut': '-',
                'status': r.status.lower(),
                'confidence': f"{r.face_match_confidence:.1f}%",
            })

        return Response({
            'summary': {
                'attendanceRate': rate,
                'present': present,
                'late': late,
                'absent': absent,
                'totalDays': total,
            },
            'records': records,
        })

    except Exception as e:
        print("REPORTS ERROR:", str(e))
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# STUDENT ATTENDANCE HISTORY (for dashboard)
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_history(request):
    """Returns statistics + recent 5 records for the student dashboard."""

    try:
        user = request.user
        records_qs = Attendance.objects.filter(student=user).order_by('-date', '-time')

        total = records_qs.count()
        present = records_qs.filter(status='Present').count()
        late = records_qs.filter(status='Late').count()
        absent = records_qs.filter(status='Absent').count()
        rate = round((present / total) * 100) if total > 0 else 0

        recent = []
        for r in records_qs[:5]:
            recent.append({
                'date': r.date.strftime('%d %b %Y'),
                'status': r.status,
                'time': r.time.strftime('%I:%M %p') if r.time else '',
                'match': f"Face match: {r.face_match_confidence:.1f}%",
            })

        return Response({
            'statistics': {
                'totalDays': total,
                'present': present,
                'late': late,
                'absent': absent,
                'attendanceRate': rate,
            },
            'recentActivity': recent,
        })

    except Exception as e:
        print("HISTORY ERROR:", str(e))
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# TEACHER REPORTS
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_reports(request):
    """Returns all student attendance records for teacher view."""

    try:
        records_qs = Attendance.objects.select_related('student').order_by('-date', '-time')

        # ── Compute summary from ALL records ──────────────────────
        total   = records_qs.count()
        present = records_qs.filter(status='Present').count()
        late    = records_qs.filter(status='Late').count()
        absent  = records_qs.filter(status='Absent').count()
        rate    = round((present / total) * 100) if total > 0 else 0

        records = []
        for r in records_qs:
            records.append({
                'id':           str(r.id),
                'student_name': r.student.name,
                'student_id':   r.student.user_id,
                'date':         r.date.strftime('%d %b %Y'),
                'raw_date':     r.date.isoformat(),
                'time_in':      r.time.strftime('%I:%M %p') if r.time else '-',
                'time_out':     '-',
                'status':       r.status,
                'confidence':   f"{r.face_match_confidence:.1f}%",
            })

        return Response({
            # FIXED: summary block was missing — TeacherAttendanceReports and
            # TeacherDashboard both read data.summary for the stat cards.
            'summary': {
                'rate':    rate,
                'present': present,
                'late':    late,
                'absent':  absent,
                'total':   total,
            },
            'records': records,
        })

    except Exception as e:
        print("TEACHER REPORTS ERROR:", str(e))
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)