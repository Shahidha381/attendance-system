from django.urls import path
from .views import register_user, login_user, face_login,  get_students

urlpatterns = [
    path("register/", register_user),
    path("login/", login_user),
    path("face-login/", face_login),
    path("students/", get_students),
]