# Tymelyne - Learning Time Management App

Tymelyne is an innovative learning application that helps users manage their time effectively while learning new skills. The app includes course creation, progress tracking, and interactive learning features.

## Features

- **AI Course Generation**: Create personalized learning paths with AI
- **Progress Tracking**: Monitor your learning progress with XP and achievements
- **Interactive Activities**: Practice with hands-on activities and quizzes
- **Social Learning**: View and share learning achievements

## Project Structure

- **Frontend**: React Native (Expo) application
- **Backend**: Django REST API
- **Docker**: Configuration for containerized development

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker and Docker Compose (for containerized development)

### Option 1: Running with Docker (Recommended)

The simplest way to get started with Tymelyne is to use Docker:

1. Clone the repository:
   ```bash
   git clone https://github.com/marcdejesus/tymelyne.git
   cd tymelyne
   ```

2. Start the application using the provided script:
   ```bash
   chmod +x ./docker/start.sh
   ./docker/start.sh
   ```

3. Access the application:
   - Backend API: http://localhost:8000
   - Frontend Expo: http://localhost:19000

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## Connecting from a Real Device (Phone/Tablet)

To connect to the app from a physical device:

1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's local IP address (e.g., 192.168.1.145)
3. Update the API URL in `frontend/src/api/api.js` to use your local IP
4. Run the backend server with: 
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
5. Run the Expo server with:
   ```bash
   npx expo start --tunnel
   ```
6. Scan the QR code with the Expo Go app on your phone
   
## API Endpoints

The API documentation is available at http://localhost:8000/api/docs/ when the backend server is running.

## Troubleshooting

### Docker Issues

1. If Docker gives a "no such file or directory" error for startup scripts:
   - Make sure all scripts have execute permissions: 
     ```bash
     chmod +x ./docker/start.sh ./docker/start-django.sh ./docker/start-expo.sh
     ```
   - Fix any line ending issues with:
     ```bash
     tr -d '\r' < ./docker/start-django.sh > /tmp/sd.sh && mv /tmp/sd.sh ./docker/start-django.sh
     tr -d '\r' < ./docker/start-expo.sh > /tmp/se.sh && mv /tmp/se.sh ./docker/start-expo.sh
     ```
   - Verify the script paths in Dockerfiles and docker-compose.yml are correct

2. If Django migrations fail during startup:
   - The startup script will continue even if migrations have issues
   - Check the logs with `docker-compose logs backend` to see specific error messages
   - You can manually run migrations if needed: 
     ```bash
     docker exec -it tymelyne-backend python manage.py migrate
     ```

3. For Expo web support issues:
   - The Docker setup now automatically adds the required web dependencies (react-dom, react-native-web, @expo/metro-runtime)
   - If you see errors about missing web dependencies, rebuild the frontend container with:
     ```bash
     docker-compose build --no-cache frontend
     ```
   - The startup process may take up to 60 seconds on first run
   - You can access the Metro bundler UI at http://localhost:19002
   - Access the Expo app at http://localhost:19000

4. For CORS issues between frontend and backend:
   - Verify the CORS settings in the Django settings.py file
   - Make sure the frontend is using the correct API URL
   - Check network requests in the browser console

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 