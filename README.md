# TymeLyne

A time management and goal tracking application built with React Native (Expo) and Django REST Framework.

## Project Structure

- `frontend`: React Native application using Expo
- `backend`: Django REST Framework API

## Getting Started

### Prerequisites

- Node.js (18+) and npm
- Python 3.8+
- PostgreSQL (optional, SQLite is configured by default)

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following variables:
```
# API URL - Update this to your local IP address
API_URL=http://192.168.1.61:8000/api
```

4. Start the development server:
```
npm start
```

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Create a virtual environment:
```
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```
pip install -r requirements.txt
```

5. Create a `.env` file with the following variables:
```
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=True
FRONTEND_URL=http://192.168.1.61:19006
```

6. Run migrations:
```
python manage.py migrate
```

7. Create a superuser:
```
python manage.py createsuperuser
```

8. Start the development server:
```
python manage.py runserver 0.0.0.0:8000
```

## API Documentation

The API endpoints are organized around the following resources:

- `/api/auth/` - Authentication endpoints (login, register, token refresh)
- `/api/users/` - User profile management
- `/api/goals/` - Goal tracking and management
- `/api/tasks/` - Task management

### Authentication

The API uses JWT (JSON Web Token) authentication. To authenticate requests:

1. Obtain a token by sending a POST request to `/api/auth/login/` with username and password
2. Include the token in subsequent requests in the Authorization header:
   `Authorization: Bearer <token>`

## Features

- User authentication with JWT
- User profiles with avatars
- Goal tracking with milestones
- Task management with status tracking
- Achievement system
- Responsive design for mobile devices

## Development

### Running Tests

Backend:
```
cd backend
pytest
```

### Code Quality

Backend:
```
cd backend
black .
flake8
isort .
```