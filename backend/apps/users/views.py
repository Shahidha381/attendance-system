import base64
import uuid
import os
import numpy as np
import face_recognition

from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password, check_password

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User
from .utils import get_face_encoding
from .token_utils import generate_tokens


# =========================
# REGISTER USER
# =========================
@api_view(["POST"])
def register_user(request):
    try:
        data       = request.data
        name       = data.get("name")
        email      = data.get("email")
        role       = data.get("role")
        user_id    = data.get("user_id")
        password   = data.get("password")
        image_data = data.get("image")

        if not all([name, email, role, user_id, password, image_data]):
            return Response({"error": "All fields are required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=400)

        format, imgstr = image_data.split(";base64,")
        ext        = format.split("/")[-1]
        file_name  = f"{uuid.uuid4()}.{ext}"
        image_file = ContentFile(base64.b64decode(imgstr), name=file_name)

        user = User.objects.create(
            name=name, email=email, role=role, user_id=user_id,
            password=make_password(password), face_image=image_file,
        )

        encoding = get_face_encoding(user.face_image.path)
        if encoding:
            user.face_encoding = encoding
            user.save()
        else:
            user.delete()
            return Response({"error": "No face detected"}, status=400)

        return Response({
            "message": "User registered successfully",
            "user": {
                "id": str(user.id), "name": user.name,
                "email": user.email, "role": user.role, "user_id": user.user_id,
            }
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# PASSWORD LOGIN
# =========================
@api_view(["POST"])
def login_user(request):
    try:
        email    = request.data.get("email")
        password = request.data.get("password")
        role     = request.data.get("role")

        if not email or not password or not role:
            return Response({"error": "Email, password and role are required"}, status=400)

        user = User.objects.filter(email=email, role=role).first()
        if not user:
            return Response({"error": "User not found"}, status=404)

        if not check_password(password, user.password):
            return Response({"error": "Invalid password"}, status=400)

        tokens = generate_tokens(user)

        return Response({
            "message": "Login successful",
            "user": {
                "id": str(user.id), "name": user.name,
                "email": user.email, "role": user.role, "user_id": user.user_id,
            },
            "tokens": tokens
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# FACE VERIFY  ← renamed / fixed
# Verifies face belongs to a SPECIFIC user (identified by user_uuid).
# Used as the 2nd factor after password login.
# =========================
@api_view(["POST"])
def face_login(request):
    try:
        image     = request.FILES.get("image")
        role      = request.data.get("role")
        user_uuid = request.data.get("user_uuid")   # ← NEW: specific user to verify

        if not image:
            return Response({"error": "Image required"}, status=400)
        if not role:
            return Response({"error": "Role required"}, status=400)

        # Save temp image
        temp_filename = f"temp_{uuid.uuid4()}.jpg"
        temp_path     = os.path.join("media", temp_filename)
        with open(temp_path, "wb") as f:
            for chunk in image.chunks():
                f.write(chunk)

        login_encoding = get_face_encoding(temp_path)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not login_encoding:
            return Response({"error": "No face detected in image"}, status=400)

        # ── CASE 1: verify against a SPECIFIC user (2nd-factor after password) ──
        if user_uuid:
            try:
                user = User.objects.get(id=user_uuid, role=role)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            if not user.face_encoding:
                return Response({"error": "No face registered for this account"}, status=400)

            stored  = np.array(user.face_encoding)
            current = np.array(login_encoding)
            match   = face_recognition.compare_faces([stored], current, tolerance=0.55)

            if match[0]:
                # Face verified — return the SAME user's token (no substitution)
                tokens = generate_tokens(user)
                return Response({
                    "message": "Face verified successfully",
                    "user": {
                        "id": str(user.id), "name": user.name,
                        "email": user.email, "role": user.role, "user_id": user.user_id,
                    },
                    "tokens": tokens,
                    "verified": True,
                })
            else:
                return Response({
                    "error": "Face does not match the registered face for this account",
                    "verified": False,
                }, status=400)

        # ── CASE 2: pure face login (no password step) — match against all users ──
        users = User.objects.filter(role=role)
        for user in users:
            if user.face_encoding:
                stored  = np.array(user.face_encoding)
                current = np.array(login_encoding)
                match   = face_recognition.compare_faces([stored], current, tolerance=0.5)
                if match[0]:
                    tokens = generate_tokens(user)
                    return Response({
                        "message": "Face login success",
                        "user": {
                            "id": str(user.id), "name": user.name,
                            "email": user.email, "role": user.role, "user_id": user.user_id,
                        },
                        "tokens": tokens,
                    })

        return Response({"error": "Face not recognized"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# GET ALL STUDENTS — real DB data
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_students(request):
    try:
        from apps.attendance.models import Attendance

        students     = User.objects.filter(role="student")
        student_data = []

        for student in students:
            records_qs = Attendance.objects.filter(student=student).order_by("-date", "-time")
            total   = records_qs.count()
            present = records_qs.filter(status="Present").count()
            late    = records_qs.filter(status="Late").count()
            absent  = records_qs.filter(status="Absent").count()
            rate    = round((present / total) * 100) if total > 0 else 0

            recent = []
            for r in records_qs[:5]:
                recent.append({
                    "date":       r.date.strftime("%d %b %Y"),
                    "status":     r.status.lower(),
                    "timeIn":     r.time.strftime("%I:%M %p") if r.time else "",
                    "confidence": f"{r.face_match_confidence:.1f}%",
                })

            student_data.append({
                "id":               str(student.id),
                "name":             student.name,
                "email":            student.email,
                "studentId":        student.user_id,
                "face_image":       student.face_image.url if student.face_image else None,
                "attendanceRate":   rate,
                "totalDays":        total,
                "present":          present,
                "late":             late,
                "absent":           absent,
                "status":           "Active",
                "recentAttendance": recent,
            })

        return Response(student_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)