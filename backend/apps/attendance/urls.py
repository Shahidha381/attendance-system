from django.urls import path
from . import views

urlpatterns = [
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('register-face/', views.register_face, name='register_face'),
    path('reports/', views.attendance_reports, name='attendance_reports'),
    path('history/', views.attendance_history, name='attendance_history'),
    path('teacher-reports/', views.teacher_reports, name='teacher_reports'),
]
