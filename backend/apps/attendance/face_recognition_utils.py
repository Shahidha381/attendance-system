import cv2
import numpy as np
import face_recognition
from apps.users.models import User


class FaceRecognizer:

    def __init__(self):
        self.known_face_encodings = []
        self.known_face_ids = []
        self.load_known_faces()

    def load_known_faces(self):
        """Load all registered face encodings from the database."""
        users = User.objects.exclude(face_encoding__isnull=True).exclude(face_encoding__exact='[]')
        for user in users:
            if user.face_encoding:
                encoding = np.array(user.face_encoding)
                self.known_face_encodings.append(encoding)
                self.known_face_ids.append(str(user.id))   # always store as string

    def _to_rgb(self, image):
        """Convert OpenCV BGR image to RGB that face_recognition expects."""
        if image is None:
            return None
        # face_recognition needs RGB; OpenCV gives BGR
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    def register_face(self, image, student_id):
        """Register a new face encoding for a student."""
        try:
            rgb = self._to_rgb(image)
            if rgb is None:
                return {'success': False, 'message': 'Invalid image received'}

            face_locations = face_recognition.face_locations(rgb)

            if len(face_locations) == 0:
                return {'success': False, 'message': 'No face detected in image'}

            if len(face_locations) > 1:
                return {'success': False, 'message': 'Multiple faces detected — please ensure only one face is visible'}

            face_enc = face_recognition.face_encodings(rgb, face_locations)[0]

            # student_id may be a UUID object or string — str() handles both
            user = User.objects.get(id=str(student_id))
            user.face_encoding = face_enc.tolist()
            user.save()

            return {'success': True, 'message': 'Face registered successfully'}

        except User.DoesNotExist:
            return {'success': False, 'message': 'User not found in database'}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    def recognize_face(self, image):
        """Recognize a face from an image and return the matched user."""
        try:
            rgb = self._to_rgb(image)
            if rgb is None:
                return {'success': False, 'message': 'Invalid image received'}

            if len(self.known_face_encodings) == 0:
                return {'success': False, 'message': 'No registered faces found in the system'}

            face_locations = face_recognition.face_locations(rgb)

            if len(face_locations) == 0:
                return {'success': False, 'message': 'No face detected — please look directly at the camera'}

            face_enc = face_recognition.face_encodings(rgb, face_locations)[0]

            face_distances = face_recognition.face_distance(self.known_face_encodings, face_enc)

            best_index = int(np.argmin(face_distances))
            best_distance = face_distances[best_index]
            confidence = (1 - best_distance) * 100

            if confidence > 50:
                return {
                    'success': True,
                    'confidence': float(confidence),
                    'user_id': self.known_face_ids[best_index],   # always a string UUID
                    'message': 'Face recognized successfully',
                }
            else:
                return {
                    'success': False,
                    'confidence': float(confidence),
                    'message': f'Face not recognized (confidence: {confidence:.1f}%). Please re-register or improve lighting.',
                }

        except Exception as e:
            return {'success': False, 'message': str(e)}