# AI-Based Attendance System Using Face Recognition

## Project Overview

The AI-Based Attendance System Using Face Recognition is a web application designed to automate attendance management using facial recognition technology. The system captures facial images through a webcam, identifies registered users, and records attendance automatically. It reduces manual work and helps minimize proxy attendance.

The project uses React.js for the frontend and Django for the backend, with OpenCV and the `face_recognition` library for facial detection and recognition.

## Technologies Used

**Frontend**
- React.js
- JavaScript
- Axios
- React Router DOM
- HTML and CSS

**Backend**
- Python
- Django
- Django REST Framework
- OpenCV
- face_recognition
- SQLite

## Main Features

- User registration with facial image capture.
- Face recognition through a webcam.
- Automatic attendance marking for recognized users.
- Prevention of duplicate attendance records.
- Role-based access for students and administrators.
- Attendance record management and dashboard display.

## Project Structure


attendance_system/
├── README.md
├── backend/
│   ├── manage.py
│   ├── config/
│   ├── apps/
│   │   ├── users/
│   │   └── attendance/
│   └── media/
└── frontend/
    ├── package.json
    ├── public/
    └── src/
        ├── api/
        ├── components/
        └── services/
```

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment on Windows:

   ```bash
   python -m venv venv310
   venv310\Scripts\activate
   ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations and start the server:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

The Django backend runs at `http://127.0.0.1:8000/`.

### Frontend Setup

1. Open a separate terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies and start the application:

   ```bash
   npm install
   npm start
   ```

The React frontend runs at `http://localhost:3000/`.

## How It Works

1. A user registers with the required details and facial image.
2. The backend processes the image and stores the user's face encoding.
3. The user captures their face through the webcam for recognition.
4. The system compares the captured face with registered face encodings.
5. When a registered user is recognized, attendance is marked automatically.
6. Attendance information can be viewed through the dashboard, depending on the user's role.

## Future Enhancements

- Improved recognition in different lighting conditions.
- Liveness detection for enhanced security.
- Cloud deployment and mobile application support.
- Integration with existing attendance management systems.

## Conclusion

This project combines web development and facial recognition to provide a convenient approach to attendance management. By integrating React.js, Django, and OpenCV, the system aims to make attendance recording faster, more efficient, and easier to manage.

