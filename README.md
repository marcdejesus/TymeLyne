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

## Design System

TymeLyne uses a comprehensive design system to ensure consistent UI/UX across the application.

### Design Components

- **Typography**: Using Montserrat font with consistent sizes and weights
- **Color Palette**: Modern palette with primary, secondary, and accent colors
- **Components**: Reusable UI components (Button, Input, Card, Typography)
- **Spacing**: Standardized spacing values for consistent layout
- **Shadows & Elevation**: Consistent shadow styles

### UI Components

- `Button.js` - Reusable button component with multiple variants
- `Card.js` - Card container component with elevation options
- `Input.js` - Text input component with multiple states
- `Typography.js` - Text component with variants for headings, body text, etc.
- `Screen.js` - Screen container with header and navigation
- `BottomNavigation.js` - Bottom tab navigation component

To view the design system guide, import and render the `DesignSystemGuide` component:

```javascript
import DesignSystemGuide from '../components/DesignSystemGuide';
```

## Course Screens Implementation

The course section flow consists of several screens:

1. **CourseDetailsScreen** - Lists all sections of a course
2. **SectionContent** - Displays section content and practice quizzes
3. **SectionQuiz** - Implements the timed quiz functionality with success/failure states

### User Flow

1. User selects a course from the home screen
2. Course details screen shows sections of the course
3. User selects a section to view its content
4. Section content screen shows text content and practice quiz
5. User can check their answers or start the full quiz
6. Quiz has a timer that decreases with each wrong answer
7. User sees success or failure screen based on quiz results

### Implementation Notes

- **CourseDetailsScreen**: Displays a list of sections for a course
- **SectionContent**: Displays text content and practice quiz
- **SectionQuiz**: Has multiple states (Intro, Quiz, Failed, Completed)

### Adding New Sections

To add a new section:

1. Add a section object to the `sections` array in `CourseDetailsScreen.js`
2. Create corresponding content in `SectionContent.js`
3. Add quiz questions in `SectionQuiz.js`

## Development Guidelines

- Use the components from the design system for consistency
- Follow the naming conventions established in the codebase
- Run tests before submitting pull requests
- Ensure responsive design for different device sizes
