const { OpenAI } = require('openai');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Returns a sample mock course for development and testing
 * @param {string} topic - The topic for the course
 * @param {string} difficulty - The difficulty level
 * @returns {Object} - A pre-defined sample course
 */
const getMockCourse = (topic, difficulty) => {
  console.log(`🔧 Using MOCK course data for topic: "${topic}" with difficulty: ${difficulty}`);
  
  return {
    "title": `Introduction to ${topic}`,
    "description": `A beginner-friendly course designed to introduce you to the world of ${topic}. Whether you're completely new or have some basic knowledge, this course will help you build a solid foundation and develop practical skills. NOTE: This is currently using pre-configured example content - real AI-generated content will be more tailored to the specific topic.`,
    "sections": [
      {
        "title": "Getting Started with Basics",
        "description": "Learn the fundamental concepts and terminology that every beginner needs to know.",
        "content": `[EXAMPLE CONTENT] Welcome to the first section of your ${topic} journey! This is using placeholder content until API connectivity is established.\n\nIn a fully-generated course, this section would contain detailed information specific to ${topic}, covering fundamental concepts, terminology, and basic techniques.\n\nThe content would be much more specific to ${topic}, discussing its unique aspects, important foundational knowledge, and initial steps to get started. It would explain core principles in detail and provide examples relevant to beginners.`,
        "hasQuiz": true,
        "quiz": {
          "questions": [
            {
              "question": `What is the main purpose of learning ${topic}?`,
              "options": ["To become famous overnight", "To build a foundation for more advanced skills", "To impress friends", "To make money quickly"],
              "correctAnswer": 1
            },
            {
              "question": "What is the best approach when learning a new skill?",
              "options": ["Rush through the basics", "Practice consistently", "Only learn theory", "Avoid making mistakes"],
              "correctAnswer": 1
            },
            {
              "question": "Why is understanding terminology important?",
              "options": ["It's not important", "To communicate effectively with others", "Only professionals need it", "To make learning complicated"],
              "correctAnswer": 1
            }
          ]
        }
      },
      {
        "title": "Essential Tools and Resources",
        "description": "Discover the tools, software, and resources that will help you practice and improve.",
        "content": `Now that you understand the basics of ${topic}, it's time to explore the tools and resources that will help you practice and improve your skills.\n\nIn this section, we'll cover both free and paid options, so you can choose what works best for your situation. Whether you're on a tight budget or ready to invest in professional tools, you'll find recommendations that suit your needs.\n\nWe'll discuss software options, online platforms, community resources, and reference materials that beginners find most helpful. We'll also talk about how to set up your learning environment for maximum productivity and enjoyment.\n\nBy the end of this section, you'll have a clear idea of which tools and resources to use for practicing ${topic}, and you'll be ready to start applying what you've learned in practical ways.`,
        "hasQuiz": true,
        "quiz": {
          "questions": [
            {
              "question": "Why is it important to choose the right tools when learning?",
              "options": ["The most expensive tools are always best", "The right tools can make learning more efficient", "Tools don't matter at all", "You should try every tool available"],
              "correctAnswer": 1
            },
            {
              "question": "What should you consider when setting up your learning environment?",
              "options": ["Only aesthetics matter", "Comfort and minimal distractions", "It should impress others", "The more cluttered, the better"],
              "correctAnswer": 1
            },
            {
              "question": "What's the best approach to choosing between free and paid resources?",
              "options": ["Always choose free options", "Always choose paid options", "Consider your budget and needs", "Randomly pick resources"],
              "correctAnswer": 2
            }
          ]
        }
      },
      {
        "title": "First Simple Project",
        "description": "Complete your first beginner-friendly project with step-by-step guidance.",
        "content": `It's time to put your knowledge into practice! In this section, we'll guide you through your first complete ${topic} project from start to finish.\n\nWe've designed this project to be simple enough for absolute beginners while still being interesting and rewarding. You'll apply the concepts you've learned so far and gain confidence through hands-on practice.\n\nWe'll break down the project into manageable steps, explain the reasoning behind each decision, and offer troubleshooting tips for common issues beginners face. Don't worry about making mistakes—they're an essential part of the learning process!\n\nBy the end of this section, you'll have completed your first ${topic} project, which will serve as tangible proof of your progress and a foundation for more complex projects in the future.`,
        "hasQuiz": true,
        "quiz": {
          "questions": [
            {
              "question": "What's the main purpose of completing a beginner project?",
              "options": ["To create something perfect", "To apply knowledge and build confidence", "To impress others", "To make money"],
              "correctAnswer": 1
            },
            {
              "question": "How should you approach mistakes during your first project?",
              "options": ["Avoid making any mistakes", "Give up if you make mistakes", "View them as learning opportunities", "Ignore them completely"],
              "correctAnswer": 2
            },
            {
              "question": "What's the most important factor in choosing your first project?",
              "options": ["It should be extremely challenging", "It should match your current skill level", "It should be very quick to complete", "It should use expensive tools"],
              "correctAnswer": 1
            }
          ]
        }
      },
      {
        "title": "Common Mistakes and Troubleshooting",
        "description": "Learn to identify and fix common issues that beginners encounter.",
        "content": `Even experienced practitioners make mistakes, but beginners tend to encounter certain common issues when learning ${topic}. In this section, we'll explore these common pitfalls and how to overcome them.\n\nWe'll discuss the mistakes that almost every beginner makes and provide clear solutions for each one. You'll learn to identify warning signs early and develop problem-solving strategies that will serve you throughout your journey.\n\nIn addition to addressing common errors, we'll also cover basic troubleshooting techniques that will help you diagnose and fix issues on your own. This self-sufficiency is crucial for building confidence and independence as you progress.\n\nBy the end of this section, you'll have a solid understanding of what can go wrong in ${topic} and how to fix it, saving you hours of frustration and accelerating your learning process.`,
        "hasQuiz": true,
        "quiz": {
          "questions": [
            {
              "question": "Why is it helpful to study common mistakes?",
              "options": ["To feel superior to others", "To avoid making them yourself", "Mistakes aren't worth studying", "To criticize others"],
              "correctAnswer": 1
            },
            {
              "question": "What's the first step in troubleshooting a problem?",
              "options": ["Give up immediately", "Ask someone else to fix it", "Identify exactly what's happening", "Buy new equipment"],
              "correctAnswer": 2
            },
            {
              "question": "How can you benefit from making mistakes?",
              "options": ["Mistakes provide valuable learning experiences", "There's no benefit to making mistakes", "They waste time", "They cost money"],
              "correctAnswer": 0
            }
          ]
        }
      },
      {
        "title": "Building Good Habits",
        "description": "Develop routines and practices that will ensure consistent progress.",
        "content": `Consistent practice is the key to mastering any skill, including ${topic}. In this section, we'll focus on building sustainable habits that will support your long-term progress.\n\nWe'll discuss effective practice schedules, techniques for maintaining motivation, and methods for tracking your improvement over time. Whether you have just 15 minutes a day or several hours, we'll help you make the most of your available time.\n\nWe'll also address common obstacles like procrastination, burnout, and plateaus in learning, providing practical strategies for overcoming each challenge. The habits you develop now will determine your success not just in ${topic}, but in any skill you choose to learn in the future.\n\nBy the end of this section, you'll have a personalized plan for regular practice and the tools to stay motivated even when progress seems slow.`,
        "hasQuiz": true,
        "quiz": {
          "questions": [
            {
              "question": "What's more important for long-term progress?",
              "options": ["Occasional intense practice sessions", "Consistent, regular practice", "Natural talent", "Expensive equipment"],
              "correctAnswer": 1
            },
            {
              "question": "How should you approach practice scheduling?",
              "options": ["Practice only when inspired", "Create a realistic, consistent schedule", "Practice for many hours once weekly", "Randomly decide when to practice"],
              "correctAnswer": 1
            },
            {
              "question": "What's a good way to maintain motivation?",
              "options": ["Focus only on long-term goals", "Compare yourself to experts", "Track your progress and celebrate small wins", "Push yourself to exhaustion"],
              "correctAnswer": 2
            }
          ]
        }
      },
      {
        "title": "Next Steps and Resources",
        "description": "Discover where to go next after completing this course.",
        "content": `Congratulations on reaching the final section of this beginner course on ${topic}! Now let's talk about where you can go from here to continue developing your skills.\n\nIn this section, we'll outline a clear path for intermediate learning, recommend quality resources for deeper study, and suggest more advanced projects you might want to tackle next. Learning ${topic} is a journey that can last a lifetime, with endless opportunities to grow and specialize.\n\nWe'll also introduce you to communities, forums, and groups where you can connect with other learners and practitioners. These connections can provide support, feedback, and inspiration as you continue to develop your skills.\n\nBy the end of this section, you'll have a roadmap for continued learning and the confidence to take your ${topic} skills to the next level. Remember that every expert was once a beginner, and with consistent practice and curiosity, you can achieve remarkable progress.`,
        "hasQuiz": true,
        "quiz": {
          "questions": [
            {
              "question": "What's the best approach after completing a beginner course?",
              "options": ["Stop learning", "Jump immediately to advanced topics", "Follow a structured path to intermediate skills", "Start teaching others"],
              "correctAnswer": 2
            },
            {
              "question": "Why is joining a community beneficial?",
              "options": ["To show off your skills", "To get support, feedback, and inspiration", "It's not beneficial at all", "Only to network professionally"],
              "correctAnswer": 1
            },
            {
              "question": "What's the most important factor in continuing to improve?",
              "options": ["Natural talent", "Expensive tools", "Consistent practice and curiosity", "Luck"],
              "correctAnswer": 2
            }
          ]
        }
      }
    ]
  };
};

/**
 * Generates a course on a specified topic using OpenAI
 * @param {string} topic - The topic of the course
 * @param {string} difficulty - Difficulty level: 'Beginner', 'Intermediate', or 'Advanced'
 * @param {number} sectionsCount - Number of sections to generate
 * @returns {Object} - Structured course content
 */
const generateCourse = async (topic, difficulty = 'Beginner', sectionsCount = 3) => {
  try {
    console.log(`🔍 OpenAI Service: Starting course generation for: "${topic}"`);
    console.log(`🔧 Parameters: difficulty=${difficulty}, sectionsCount=${sectionsCount}`);
    
    // Check if we should use mock data (only when explicitly set to use mock data)
    const useMockData = process.env.USE_MOCK_OPENAI === 'true';
    
    if (useMockData) {
      console.log('🧪 Using mock data for course generation');
      return getMockCourse(topic, difficulty);
    }
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI Service: Missing API key');
      throw new Error('OpenAI API key is not configured');
    }
    
    console.log('📝 OpenAI Service: Preparing prompt...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o-mini for creating educational content
      messages: [
        {
          role: "system",
          content: "You are an expert course creator specialized in creating educational content. Generate a well-structured, detailed, and engaging course with accurate information. Personalize the content to be specific to the given topic, avoiding generic responses. Create quiz questions that truly test understanding of the material rather than general knowledge. Ensure each section flows logically into the next and builds upon previous content."
        },
        {
          role: "user",
          content: `Create a ${difficulty} level course about "${topic}" with ${sectionsCount} sections. 
          The response should be a valid JSON object with the following structure:
          {
            "title": "Course title",
            "description": "Course description (100-150 words)",
            "sections": [
              {
                "title": "Section title",
                "description": "Section description (50-80 words)",
                "content": "Detailed section content (300-500 words)",
                "hasQuiz": true,
                "quiz": {
                  "questions": [
                    {
                      "question": "Question text",
                      "options": ["option1", "option2", "option3", "option4"],
                      "correctAnswer": 0
                    },
                    {
                      "question": "Question text",
                      "options": ["option1", "option2", "option3", "option4"],
                      "correctAnswer": 1
                    },
                    {
                      "question": "Question text",
                      "options": ["option1", "option2", "option3", "option4"],
                      "correctAnswer": 2
                    }
                  ]
                }
              }
            ]
          }`
        }
      ],
      temperature: 0.8,
      max_tokens: 8000,
      response_format: { type: "json_object" }
    });

    console.log(`✅ OpenAI Service: Received response, status=${response.status}`);
    console.log(`📊 OpenAI Service: Usage stats:`, {
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
      total_tokens: response.usage?.total_tokens
    });
    
    try {
      const courseData = JSON.parse(response.choices[0].message.content);
      console.log(`✅ OpenAI Service: Successfully parsed JSON`);
      console.log(`📚 Generated "${courseData.title}" with ${courseData.sections.length} sections`);
      
      return courseData;
    } catch (parseError) {
      console.error('❌ OpenAI Service: Failed to parse JSON response:', parseError);
      console.error('📄 Raw response content:', response.choices[0].message.content);
      throw new Error('Failed to parse course content from OpenAI response');
    }
  } catch (error) {
    console.error('❌ OpenAI Service: Error during course generation:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
      model: "gpt-4o-mini"
    });
    
    // Check for specific error types
    if (error.code === 'insufficient_quota') {
      console.error('💰 OpenAI Service: API quota exceeded');
      console.log('🧪 Falling back to mock data due to quota exceeded');
      // Create a customized mock course with a clear message about API quota
      const mockCourse = getMockCourse(topic, difficulty);
      mockCourse.description = `This is a demo course on ${topic}. NOTICE: OpenAI API quota has been exceeded. Please verify you have credits in your OpenAI account (min $5 required). This is using pre-configured example content.`;
      return mockCourse;
    } else if (error.code === 'invalid_api_key') {
      console.error('🔑 OpenAI Service: Invalid API key');
      console.log('🧪 Falling back to mock data due to invalid API key');
      const mockCourse = getMockCourse(topic, difficulty);
      mockCourse.description = `This is a demo course on ${topic}. NOTICE: OpenAI API key is invalid. Please check your .env file and ensure the API key is correctly formatted. This is using pre-configured example content.`;
      return mockCourse;
    } else if (error.status === 429) {
      console.error('⏱️ OpenAI Service: Rate limit exceeded');
      console.log('🧪 Falling back to mock data due to rate limit');
      const mockCourse = getMockCourse(topic, difficulty);
      mockCourse.description = `This is a demo course on ${topic}. NOTICE: OpenAI API rate limit exceeded. Please try again in a few minutes. The GPT-4o-mini model has a limit of 60 RPM. This is using pre-configured example content.`;
      return mockCourse;
    } else if (error.code === 'model_not_found') {
      console.error('🔎 OpenAI Service: Model not found');
      console.log('🧪 Falling back to mock data due to model not being available');
      const mockCourse = getMockCourse(topic, difficulty);
      mockCourse.description = `This is a demo course on ${topic}. NOTICE: The requested model (gpt-4o-mini) was not found. Please make sure your account has access to this model. This is using pre-configured example content.`;
      return mockCourse;
    }
    
    // For any other error, don't use mock data - throw the error
    throw error;
  }
};

module.exports = {
  generateCourse
}; 