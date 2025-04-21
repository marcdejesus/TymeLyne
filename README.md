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

2. Create A Root .env File:
   - Duplicate the .env.example file to your root directory
   - Rename it as .env
   - Replace all instances of your public/private IP with your actual IP
  
3. Create A Backend .env File:
   - Duplicate the .env.example file in the backend directory
   - Rename it as .env.backend
   - Replace all instances of IP with your actual IP
  
3. Create A app.js File:
   - Duplicate the api.js.example file underneath app/frontend/src/services/
   - Rename it to api.js
   - Replace YOUR_LOCAL_IP_HERE with your local IP 

2. Start the application using the provided script:
   ```bash
   docker-compose up -d
   ```

3. Accessing Mobile Build:
   cd frontend
   ```bash
   npx expo start
   ```
   Using your phone camera, scan the qr code

5. Access the application:
   - Backend API: http://localhost:8000 /admin for admin login
   - Frontend Expo: Scan terminal QR code
  
6. Close Build:
   - ctrl + c in terminal to kill Expo
   - ```bash
     docker-compose down
     ``` To shut down Docker


### Option 2: Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd tymelyne/backend
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
   cd tymelyne/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Connecting from a Real Device (Phone/Tablet)

To access the API from your phone or tablet using Expo Go, follow these steps:

1. Run the setup script to detect your local IP and update the frontend:
```bash
./update_api_url.sh
```

2. Start the backend server with local IP info:
```bash
cd backend
./run_with_ip.sh
```

3. Start the Expo development server:
```bash
cd frontend
npx expo start
```

4. Scan the QR code with the Expo Go app on your device
   - Make sure your phone is on the same Wi-Fi network as your computer
   - The backend API should now be accessible from your phone

## API Endpoints

- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Retrieve a task
- `PUT /api/tasks/{id}/` - Update a task
- `DELETE /api/tasks/{id}/` - Delete a task

## Troubleshooting

### Network Connection Errors

If you're getting network errors when trying to connect from Expo Go to your backend:

1. **Verify your computer's IP address and configuration**:
   ```bash
   # Run this from the project root
   ./update_api_url.sh
   
   # Run the network diagnostic tool
   cd backend && ./check_network.sh
   ```

2. **Check macOS firewall settings**:
   - Go to System Preferences > Security & Privacy > Firewall
   - Click on "Firewall Options..."
   - Make sure Python or your terminal application is allowed to receive incoming connections

3. **Try Expo's Tunnel connection method**:
   ```bash
   cd frontend
   npx expo start --tunnel
   ```
   This will create a tunnel that bypasses network restrictions.

4. **Check both devices are on the same network**:
   - Make sure your phone and computer are connected to the same WiFi network
   - Some public networks or hotspots might block communication between devices

5. **Alternative API URL formats to try**:
   Open `frontend/src/api/api.js` and try changing to a different connection method:
   ```javascript
   // Try these different options one at a time:
   const API_URL = API_URLS.localDevice;      // Default option
   // const API_URL = 'http://YOUR_IP:8000';  // Direct IP
   // const API_URL = API_URLS.expoDevelopment; // Alternative Expo format
   ```

6. **Temporarily disable CORS for testing**:
   Make sure `CORS_ALLOW_ALL_ORIGINS = True` is enabled in Django's settings.py.

### Other Common Issues

- **API Connection Issues**: Make sure your phone and computer are on the same WiFi network
- **Cannot Connect to API**: Check firewall settings to allow incoming connections on port 8000
- **Expo Can't Connect**: Try using the "Tunnel" connection method in Expo

## Testing the Connection

1. Start both the backend and frontend servers
2. Use the app to create, view, update, and delete tasks
