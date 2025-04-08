/**
 * Course Generator Service
 * 
 * This service handles communication with the DeepSeek API to generate
 * course content based on user preferences.
 */

// API configuration - would be stored in environment variables in a real app
const API_CONFIG = {
  apiKey: 'YOUR_DEEPSEEK_API_KEY', // Replace with your actual API key
  endpoint: 'https://api.deepseek.com', // Replace with the actual API endpoint
};

/**
 * Generate a prompt for the DeepSeek API based on user form data
 * 
 * @param {Object} formData - User preferences from the course creator form
 * @returns {String} - A formatted prompt for the AI
 */
const generatePrompt = (formData) => {
  return `
Create a comprehensive learning course on ${formData.topic} with the following specifications:

LEARNER PROFILE:
- End Goal: ${formData.goal}
- Specific Use Case: ${formData.useCase || 'General knowledge and skills'}
- Prior Experience: ${formData.hasPriorExperience ? 'Yes' : 'No'}
- Current Skill Level: ${formData.skillLevel}
- Existing Knowledge: ${formData.existingKnowledge || 'None specified'}

LEARNING PREFERENCES:
- Preferred Content Types: ${formData.learningStyle}
- Gamification Elements: ${formData.enjoysGamification ? 'Yes, include rewards and game mechanics' : 'No, keep it straightforward'}
- Project-Based Learning: ${formData.wantsProjects ? 'Yes, include practical projects' : 'No, focus on concepts'}

TIME COMMITMENT:
- Days per Week: ${formData.daysPerWeek}
- Time per Session: ${formData.timePerDay}
- Overall Timeline: ${
    formData.timeCommitment === 'short' ? 'Short (1-2 weeks)' :
    formData.timeCommitment === 'medium' ? 'Medium (1-2 months)' :
    'Long-term (ongoing)'
  }

PERSONALIZATION:
- Learner Interests: ${formData.interests || 'General'}
- Content Theme: ${formData.contentTheme}
- Learning Path Type: ${
    formData.advancedPath === 'linear' ? 'Linear, structured progression' :
    formData.advancedPath === 'challenge' ? 'Challenge-based learning' :
    'Adaptive based on performance'
  }

Create a complete course structure with:
1. A compelling course title and description
2. 4-6 modules with clear learning objectives
3. Within each module, include a mix of:
   - Lessons (explanatory content)
   - Concept checks (multiple choice questions)
   - Practice activities (hands-on exercises)
   - Challenges (applied projects)
   - Quizzes (to test knowledge)
4. Each module should build on previous ones
5. Content should match the user's skill level
6. Include examples relevant to the learner's interests

Format the response as a JSON object structured like a complete course curriculum ready to be imported into a learning platform.
`;
};

/**
 * Generate a course using the DeepSeek API
 * 
 * @param {Object} formData - User preferences from the course creator form
 * @returns {Promise<Object>} - The generated course data
 */
export const generateCourse = async (formData) => {
  try {
    // In a real implementation, this would make an actual API call
    // For now, we'll return a mock response after a delay to simulate the API call
    
    console.log('Generating course with data:', formData);
    console.log('Generated prompt:', generatePrompt(formData));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return a mock course based on the form data
    return {
      id: `${formData.topic.toLowerCase().replace(/\s/g, '-')}-101`,
      title: `${formData.topic} Fundamentals`,
      description: `Learn ${formData.topic} from scratch with this AI-generated course covering all the fundamentals you need to reach your goal of "${formData.goal}"`,
      image: 'python-logo.png', // Would be generated or selected based on topic
      author: 'AI Course Generator',
      timeToComplete: formData.timeCommitment === 'short' ? '1-2 weeks' : 
                     formData.timeCommitment === 'medium' ? '1-2 months' : '3+ months',
      xpReward: 1000,
      progress: 0,
      goals: [
        `Master the basics of ${formData.topic}`,
        `Build confidence in ${formData.topic} skills`,
        `Achieve your goal: ${formData.goal}`,
      ],
      modules: [
        {
          id: 'module1',
          title: `Introduction to ${formData.topic}`,
          description: `Get started with the fundamentals of ${formData.topic}.`,
          activities: [
            {
              id: 'activity1_1',
              type: 'lesson',
              title: `${formData.topic} Basics`,
              content: `# Introduction to ${formData.topic}\n\nThis is an AI-generated course tailored to your specific needs and learning preferences.\n\n## Your Learning Profile\n\nSkill Level: ${formData.skillLevel}\nLearning Style: ${formData.learningStyle}\nGoal: ${formData.goal}\n\nLet's begin our journey into ${formData.topic}!`
            },
            {
              id: 'activity1_2',
              type: 'concept-check',
              title: 'Basic Concepts Quiz',
              questions: [
                {
                  id: 'q1_1',
                  type: 'multiple-choice',
                  question: `What is the main goal of learning ${formData.topic}?`,
                  options: [
                    'General knowledge',
                    `${formData.goal}`,
                    'Professional certification',
                    'Academic requirement'
                  ],
                  correctAnswer: 1
                },
                {
                  id: 'q1_2',
                  type: 'true-false',
                  question: `${formData.topic} requires advanced mathematics knowledge.`,
                  correctAnswer: false
                }
              ]
            }
          ]
        },
        {
          id: 'module2',
          title: `Core Concepts in ${formData.topic}`,
          description: `Dive deeper into the essential concepts of ${formData.topic}.`,
          activities: [
            {
              id: 'activity2_1',
              type: 'lesson',
              title: `Key Principles of ${formData.topic}`,
              content: `# Core Concepts in ${formData.topic}\n\nNow that you've been introduced to the basics, let's explore the core concepts that make up ${formData.topic}.\n\n## Key Principles\n\n- First principle of ${formData.topic}\n- Second principle of ${formData.topic}\n- Third principle of ${formData.topic}\n\nThese principles form the foundation of all advanced topics we'll cover later.`
            },
            {
              id: 'activity2_2',
              type: 'practice',
              title: 'Hands-on Practice',
              instructions: `Apply what you've learned about ${formData.topic} in this exercise.`,
              starterCode: `// Your ${formData.topic} practice starts here\n\n`,
              solution: `// Example solution based on ${formData.topic}`,
              validationFunction: 'return true; // In a real implementation, this would validate the user\'s work'
            }
          ]
        }
      ]
    };
    
    // In a real implementation, it would look more like:
    /*
    const response = await fetch(`${API_CONFIG.endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        prompt: generatePrompt(formData),
        max_tokens: 4000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].text);
    */
    
  } catch (error) {
    console.error('Error generating course:', error);
    throw error;
  }
};

export default {
  generateCourse
}; 