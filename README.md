# TymeLyne

A React Native Expo application with a Node.js/MongoDB backend, containerized with Docker.

## Project Structure

- **frontend**: React Native Expo application
- **backend**: Node.js with Express and MongoDB

## Features

- User authentication (register, login, logout)
- User profile management
- Docker containerization for backend
- MongoDB database integration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Expo CLI

### Running the Backend

1. Start the backend and MongoDB using Docker Compose:

```bash
docker-compose up
```

This will start the Node.js backend on port 5000 and MongoDB on port 27017.

### Running the Frontend

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
npm start
```

4. Use the Expo Go app on your mobile device to scan the QR code or run on an emulator.

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login a user
- **GET /api/auth/me**: Get current user (requires authentication)

### Profiles

- **GET /api/profiles/:id**: Get a user profile by ID
- **PUT /api/profiles/:id**: Update a user profile (requires authentication)

## Database Schema

### Profile Collection

- **user_id** (UUID, Primary Key): User's unique identifier
- **email** (String, unique): User's email
- **username** (String): User's username
- **is_verified** (Boolean): Account verification status
- **created_at** (Date): Account creation date
- **profile_picture** (String): URL to profile picture
- **fName** (String): First name
- **lName** (String): Last name
- **bio** (String): User biography
- **dob** (Date): Date of birth
- **user_total_exp** (Number): Total experience points
- **follower_count** (Number): Number of followers
- **friends_count** (Number): Number of friends
- **current_courses** (Array): Courses in progress
- **completed_courses** (Array): Completed courses
- **theme** (String): UI theme preference
- **course_generations** (Number): Course generation count 