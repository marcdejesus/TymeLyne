# TymeLyne Backend Documentation

## Architecture Overview

TymeLyne uses a Node.js/Express backend with MongoDB as the database, following the MVC (Model-View-Controller) pattern:

- **Models**: Mongoose schemas for MongoDB collections
- **Controllers**: Business logic for handling requests
- **Routes**: API endpoint definitions
- **Middleware**: Authentication and validation logic

## Database Schema

### Profile Collection

| Field Name | Data Type | Description | Constraints |
|------------|-----------|-------------|------------|
| user_id | UUID | Unique identifier for the user | Primary Key |
| email | VARCHAR(254) | User's email address | Primary Key, Unique |
| username | VARCHAR(30) | User's username | Required |
| is_verified | BOOLEAN | Account verification status | Default: false |
| verification_token | VARCHAR | Token for email verification | Optional |
| verification_token_expires | DATETIME | Expiration date for verification token | Optional |
| created_at | DATETIME | Account creation timestamp | Default: current time |
| profile_picture | VARCHAR/TEXT | URL or path to profile picture | Optional |
| fName | VARCHAR(50) | User's first name | Optional |
| lName | VARCHAR(50) | User's last name | Optional |
| bio | TEXT | User's biography | Optional |
| dob | DATE | User's date of birth | Optional |
| user_total_exp | INT | Total experience points | Default: 0 |
| follower_count | INT | Number of followers | Default: 0 |
| friends_count | INT | Number of friends | Default: 0 |
| current_courses | ARRAY | Array of courses in progress | Default: [] |
| completed_courses | ARRAY | Array of completed courses | Default: [] |
| theme | VARCHAR(10) | UI theme preference | Default: 'light' |
| course_generations | INT | Course generation count | Default: 0 |
| password | STRING | Hashed password | Not returned in queries |

## API Endpoints

### Authentication

- **POST /api/auth/register**
  - Description: Register a new user
  - Request body: `{ email, username, password, fName, lName }`
  - Response: `{ message, token, user }`
  - Controller: `authController.register`
  - Note: Sends a verification email to the user

- **POST /api/auth/login**
  - Description: Login an existing user
  - Request body: `{ email, password }`
  - Response: `{ token, user }`
  - Controller: `authController.login`
  - Note: Checks if user's email is verified before allowing login

- **GET /api/auth/verify/:token**
  - Description: Verify user's email with token
  - Parameters: `token` - Verification token sent to user's email
  - Response: `{ message, verified }`
  - Controller: `authController.verifyEmail`

- **POST /api/auth/resend-verification**
  - Description: Resend verification email
  - Request body: `{ email }`
  - Response: `{ message }`
  - Controller: `authController.resendVerificationEmail`

- **GET /api/auth/me**
  - Description: Get current user profile
  - Headers: `Authorization: Bearer {token}`
  - Response: User profile object
  - Controller: `authController.getCurrentUser`
  - Middleware: `auth`

### Profiles

- **GET /api/profiles/:id**
  - Description: Get user profile by ID
  - Response: User profile object
  - Controller: `profileController.getProfileById`

- **PUT /api/profiles/:id**
  - Description: Update user profile
  - Headers: `Authorization: Bearer {token}`
  - Request body: Profile fields to update
  - Response: Updated profile
  - Controller: `profileController.updateProfile`
  - Middleware: `auth`

## Email Verification System

TymeLyne implements an email verification system to ensure user authenticity:

1. When a user registers, a verification token is generated and stored with an expiration date
2. A verification email is sent to the user's email address with a link containing the token
3. The user must click the link to verify their email address
4. Until verification is complete, users cannot log into the system
5. Users can request a new verification email if they didn't receive the original

### Email Service Components

- **emailService.js**: Utility for sending emails using Nodemailer
- **SMTP Configuration**: Environment variables for configuring the email service

## Middleware

### auth.js
Authentication middleware that verifies JWT tokens and adds the user to the request object.

## Controllers

### authController.js
Handles user authentication, including registration, login, verification, and retrieving the current user.

### profileController.js
Manages profile operations, such as getting profile details and updating profiles.

## Configuration

### db.js
Establishes connection to MongoDB using the connection string from environment variables.

## Environment Variables

- **PORT**: Server port (default: 5000)
- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for signing JWT tokens
- **NODE_ENV**: Environment (development, test, production)
- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port
- **SMTP_SECURE**: Whether to use secure connection
- **SMTP_USER**: SMTP username
- **SMTP_PASSWORD**: SMTP password
- **FRONTEND_URL**: URL for the frontend application

## Libraries Used

- **express**: Web server framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **uuid**: Unique ID generation
- **nodemailer**: Email sending
- **crypto**: Cryptographic functionality (built-in)

## Docker Integration

The backend is containerized using Docker, with the configuration specified in:
- **Dockerfile**: Backend container configuration
- **docker-compose.yml**: Orchestration of backend and MongoDB services 