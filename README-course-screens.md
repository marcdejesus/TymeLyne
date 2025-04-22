# Course Section Implementation

This README provides instructions on how to implement the course section screens in Tymelyne.

## Overview

The course section flow consists of several screens:

1. **CourseDetailsScreen** - Lists all sections of a course
2. **SectionContent** - Displays section content and practice quizzes
3. **SectionQuiz** - Implements the timed quiz functionality with success/failure states

## Required Assets

Replace the placeholder files with actual assets:

- `frontend/assets/logo.png` - The app logo used in quiz intro
- `frontend/assets/timer-icon.png` - Timer icon for quiz screens
- `frontend/assets/explosion-icon.png` - Icon shown when a quiz is failed
- `frontend/assets/checkmark-icon.png` - Icon shown when a section is completed

## User Flow

1. User selects a course from the home screen
2. Course details screen shows sections of the course
3. User selects a section to view its content
4. Section content screen shows text content and practice quiz
5. User can check their answers or start the full quiz
6. Quiz has a timer that decreases with each wrong answer
7. User sees success or failure screen based on quiz results

## Implementation Notes

### CourseDetailsScreen

- Displays a list of sections for a course
- Each section shows title, description, and completion status
- Tapping a section navigates to the SectionContent screen

### SectionContent

- Displays text content of the section
- Shows a practice quiz at the bottom
- Has "Check Work" and "Quiz" buttons

### SectionQuiz

- Has multiple states: Intro, Quiz, Failed, Completed
- Quiz state shows countdown timer and questions
- Failed state shows "Oops!" screen with retry option
- Completed state shows "Section Complete!" with XP earned

## Styling

All screens use the theme colors from `frontend/src/constants/theme.js`:

- Background color: #F9F1E0
- Primary color: #FF7E17
- Text color: #1A1A1A
- Secondary text color: #6B7280

## Adding New Sections

To add a new section:

1. Add a section object to the `sections` array in `CourseDetailsScreen.js`
2. Create corresponding content in `SectionContent.js`
3. Add quiz questions in `SectionQuiz.js`

## API Integration

In a real implementation, replace the mock data with API calls to fetch:

- Course details and sections
- Section content and quizzes
- Quiz results and user progress tracking 