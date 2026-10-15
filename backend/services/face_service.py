import face_recognition
import numpy as np

def encode_face(image):
    img = face_recognition.load_image_file(image)
    encodings = face_recognition.face_encodings(img)
    return encodings[0] if encodings else None

def compare_faces(stored, new):
    return face_recognition.compare_faces([stored], new)