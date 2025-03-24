# TymeLyne

A modern goal-tracking and achievement platform built with React Native and Django.

## Project Structure

```
TymeLyne/
├── frontend/          # React Native (Expo) frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── screens/      # Screen components
│   │   ├── services/     # API and external service integrations
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript type definitions
│   │   └── constants/    # Constants and configuration
│   └── App.tsx          # Root component
└── backend/          # Django backend
    ├── users/        # User management app
    ├── goals/        # Goals management app
    ├── tasks/        # Tasks management app
    └── tymeline/     # Main project configuration
```

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Django REST Framework
- **Authentication**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **AI**: DeepSeek API
- **Payments**: Stripe
- **Notifications**: OneSignal/Firebase Cloud Messaging
- **Calendar Integration**: Google Calendar API, Apple EventKit
- **Analytics**: Google Analytics for Firebase/Mixpanel

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Git
- Expo CLI
- PostgreSQL

## Getting Started

### Backend Setup

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

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Development Guidelines

- Follow the existing code patterns and conventions
- Write clean, maintainable code
- Keep files under 200-300 lines
- Avoid code duplication
- Write tests for new features
- Use proper environment variables for configuration

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

Copyright CrunchTimeStudios All Rights Reserved.