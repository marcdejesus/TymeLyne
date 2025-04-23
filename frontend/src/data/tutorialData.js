// Tutorial data for Tymelyne app
// This contains structured data for the app's tutorial course

export const tymelyneTutorialData = {
  course_id: '1',
  created_by: 'system',
  created_at: new Date().toISOString(),
  course_name: 'Tymelyne Tutorial',
  description: 'Learn how to use all the features of Tymelyne to create, share, and learn from educational content.',
  paragraph1: 'Welcome to Tymelyne! This tutorial will guide you through all the essential features of the app and help you make the most of your learning experience.',
  paragraph2: 'Tymelyne is designed to make learning interactive, engaging, and fun. Whether you want to create your own courses or learn from others, this platform has everything you need.',
  paragraph3: 'By completing this tutorial, you\'ll gain a complete understanding of how to navigate, use, and benefit from all of Tymelyne\'s features.',
  course_exp: 300,
  tags: ['tutorial', 'beginner', 'app', 'guide'],
  difficulty: 'Beginner',
  sections: [
    {
      id: 101,
      title: 'Navigating the App',
      description: 'Learn how to navigate through the Tymelyne app, understand the main screens, and use the bottom navigation menu.',
      isCompleted: false,
      content: [
        'The Tymelyne app is designed with a simple and intuitive navigation system. The main screens you\'ll use are Home, Leaderboards, and Profile, accessible via the bottom navigation bar.',
        'On the Home screen, you\'ll find your active courses, options to add new courses, and courses your friends are taking. This is your main dashboard for learning.',
        'The Leaderboards screen shows user rankings and achievements, helping you track your progress compared to others and stay motivated in your learning journey.'
      ],
      practiceQuiz: [
        {
          id: 1,
          question: 'Which screen serves as your main dashboard for learning?',
          options: ['Profile', 'Leaderboards', 'Home', 'Settings'],
          correctOption: 2
        },
        {
          id: 2,
          question: 'What can you find on the Home screen?',
          options: [
            'Only your profile information',
            'Only leaderboards',
            'Active courses and options to add new courses',
            'Only messages'
          ],
          correctOption: 2
        }
      ]
    },
    {
      id: 102,
      title: 'Taking Courses',
      description: 'Discover how to browse, enroll in, and progress through courses on Tymelyne.',
      isCompleted: false,
      content: [
        'To take a course, you first need to find one that interests you. You can browse courses from the Community section or try courses your friends are taking.',
        'Once you\'ve found a course, tap on it to view details. You\'ll see the course description, sections, and an overview. To start learning, tap on a section or the Begin Course button.',
        'Each course is divided into sections with content and quizzes. Complete each section to progress and earn experience points (XP) that will help you level up in the app.'
      ],
      practiceQuiz: [
        {
          id: 1,
          question: 'How are courses structured in Tymelyne?',
          options: [
            'As a single continuous lesson',
            'As random unconnected information',
            'Divided into sections with content and quizzes',
            'Only as video tutorials'
          ],
          correctOption: 2
        },
        {
          id: 2,
          question: 'What happens when you complete sections in a course?',
          options: [
            'Nothing happens',
            'You earn XP and progress through the course',
            'The app crashes',
            'You need to pay to continue'
          ],
          correctOption: 1
        }
      ]
    },
    {
      id: 103,
      title: 'Creating Your Own Courses',
      description: 'Learn how to create and share your own courses with the Tymelyne community.',
      isCompleted: false,
      content: [
        'Tymelyne allows you to create your own courses and share your knowledge with others. To create a course, tap on the "Create New" card in the Add a Course section.',
        'When creating a course, you\'ll need to provide a title, description, difficulty level, and tags. Then you can add sections with content and create quizzes to test knowledge.',
        'After creating your course, you can publish it to make it available to the community. Remember to create engaging content with clear explanations to help others learn effectively.'
      ],
      practiceQuiz: [
        {
          id: 1,
          question: 'How do you start creating a new course?',
          options: [
            'Tap on "Create New" in the Add a Course section',
            'Send an email to support',
            'You cannot create courses in Tymelyne',
            'Go to the Profile screen'
          ],
          correctOption: 0
        },
        {
          id: 2,
          question: 'What elements should you include when creating a course?',
          options: [
            'Only a title is needed',
            'Title, description, difficulty level, and tags',
            'Just random content',
            'Only videos are allowed'
          ],
          correctOption: 1
        }
      ]
    },
    {
      id: 104,
      title: 'Quizzes and Assessments',
      description: 'Master the quiz system in Tymelyne to test your knowledge and earn XP.',
      isCompleted: false,
      content: [
        'Quizzes are an essential part of the learning experience in Tymelyne. They help reinforce what you\'ve learned and earn you XP for progress.',
        'There are two types of quizzes: practice quizzes and section quizzes. Practice quizzes let you test your knowledge without stakes, while section quizzes are timed assessments that contribute to your course completion.',
        'When taking a section quiz, you\'ll have a time limit to answer all questions. Incorrect answers will reduce your remaining time, so think carefully!'
      ],
      practiceQuiz: [
        {
          id: 1,
          question: 'What happens when you select an incorrect answer in a section quiz?',
          options: [
            'Nothing happens',
            'You gain more time',
            'The quiz immediately ends',
            'Your remaining time is reduced'
          ],
          correctOption: 3
        },
        {
          id: 2,
          question: 'What is the difference between practice quizzes and section quizzes?',
          options: [
            'There is no difference',
            'Practice quizzes are untimed with no stakes, section quizzes are timed assessments',
            'Section quizzes are easier than practice quizzes',
            'Practice quizzes give more XP'
          ],
          correctOption: 1
        }
      ]
    },
    {
      id: 105,
      title: 'Profile and Progress',
      description: 'Track your learning progress, achievements, and customize your profile in Tymelyne.',
      isCompleted: false,
      content: [
        'Your Profile screen is where you can track your learning journey. It shows your level, XP, completed courses, and achievements.',
        'As you complete courses and quizzes, you\'ll earn XP that helps you level up. Higher levels unlock new features and show your expertise to other users.',
        'You can also customize your profile with a photo and bio. Share your learning goals and interests to connect with like-minded learners in the community.'
      ],
      practiceQuiz: [
        {
          id: 1,
          question: 'What information is displayed on your Profile screen?',
          options: [
            'Only your name',
            'Your level, XP, completed courses, and achievements',
            'Other users\' contact information',
            'Only your password'
          ],
          correctOption: 1
        },
        {
          id: 2,
          question: 'How do you level up in Tymelyne?',
          options: [
            'By paying for premium features',
            'Levels are assigned randomly',
            'By earning XP through completing courses and quizzes',
            'You cannot level up'
          ],
          correctOption: 2
        }
      ]
    }
  ]
};

export default tymelyneTutorialData; 