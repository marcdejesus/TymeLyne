# TymeLyne

A React Native Expo application with a Node.js/MongoDB backend, containerized with Docker.

## Project Structure

- **frontend**: React Native Expo application
- **backend**: Node.js with Express and MongoDB

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

1. Create .env file:

```bash
cd backend
```
- Replace all instances of server and email information with your actual information

2. Navigate to the frontend directory:

```bash
cd frontend
```

3. Install dependencies:

```bash
npm install
```

4. Start the Expo development server:

```bash
npm start
```

5. Use the Expo Go app on your mobile device to scan the QR code or run on an emulator.

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login a user
- **GET /api/auth/me**: Get current user (requires authentication)

### Profiles

- **GET /api/profiles/:id**: Get a user profile by ID
- **PUT /api/profiles/:id**: Update a user profile (requires authentication)
