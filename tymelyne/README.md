# Tymelyne

A task management application built with React Native (Expo) and Django.

## Project Structure

- `/frontend` - React Native Expo app
- `/backend` - Django REST API

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

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install django djangorestframework django-cors-headers coreapi
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Start the server:
```bash
./run.sh  # Or: python manage.py runserver 0.0.0.0:8000
```

The API will be available at http://localhost:8000/api/

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL:
   - Run `./update_api_url.sh` in the project root to automatically set your local IP
   - Or manually edit `src/api/api.js` to point to your Django server

4. Start the Expo development server:
```bash
npx expo start
```

5. Run on your device:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on your phone (make sure to use the same WiFi network)

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
3. Check that changes are reflected in the Django admin at http://localhost:8000/admin/ 