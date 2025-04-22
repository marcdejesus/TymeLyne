# Tyme Lyne Frontend

This is the frontend for the Tyme Lyne application, a platform for course tracking and management. The application allows users to register, login, view their courses, friends' courses, and manage their profile.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm start

# For iOS
npm run ios

# For Android
npm run android
```

## Demo Mode

This version uses mock data and doesn't require an active backend to run. For testing purposes:

- The app automatically logs in with a demo user
- Login credentials are pre-filled (email: demo@example.com, password: password)
- All data (courses, profile info, etc.) is mocked directly in the components
- Comments throughout the code show where backend integration would happen in production

## Implemented Screens

### Authentication Screens
- **Login Screen**: Displays welcome message with the Tyme Lyne logo, and options to register or sign in.
- **Registration Screen**: Allows new users to create an account with username, email, name, and password.

### Main Screens
- **Home Screen**: Shows active courses, options to add courses, and friends' courses.
- **Profile Screen**: Displays user information, level, followers/friends count, and top courses.
- **Development Screen**: Placeholder for features that are still under development.

## How to Run

1. Ensure you have Node.js and npm installed.
2. Install Expo CLI: `npm install -g expo-cli`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Use an emulator or the Expo Go app on your physical device to run the application.

## Features Implementation

### Authentication (Mocked)
- Login and registration with validation (using mock data)
- Authentication state is managed through React Context
- Backend integration code is commented out but ready for future implementation

### Navigation
- App uses React Navigation for seamless screen transitions
- Authentication state determines which navigation stack is displayed
- Drawer navigation for main app screens

### UI Design
- Consistent design language across all screens
- Responsive layouts that adapt to different screen sizes
- Color scheme following the design mockups

## Future Backend Integration

All components include commented code indicating where backend API calls would be implemented:

- **AuthContext.js**: Contains commented code for token storage and API authentication
- **HomeScreen.js**: Has commented API calls for fetching courses and updating progress
- **ProfileScreen.js**: Shows how profile data would be fetched from the backend

To connect to a real backend in the future:
1. Uncomment the SecureStore and axios imports and move them back to dependencies in package.json
2. Uncomment and implement the API calls in each component
3. Replace mock data with actual data fetching logic
4. Set up proper error handling for API requests

## Development Notes

### Unimplemented Features
- Actual course content viewing and progress tracking
- Friend interactions (adding, removing, messaging)
- Achievements system
- Course creation and publishing
- Community course discovery

These features will navigate to the Development screen when selected.

### Mock Data
The app currently uses mock data for demonstration purposes:
- Sample course icons from assets
- Mock course progress
- Mock friend data

### Backend Communication
Backend API calls are defined in the AuthContext, but some features are currently using mock data with pseudo-code comments explaining how they would interact with the backend in the future. 