#!/usr/bin/env node

/**
 * Test script for AI logo generation functionality
 * Usage: node scripts/test-logo-generation.js
 */

require('dotenv').config();
const { generateCourseLogo } = require('../services/openai.service');

async function testLogoGeneration() {
  console.log('🧪 Testing AI Logo Generation');
  console.log('=====================================');
  
  const testCases = [
    { topic: 'JavaScript Programming', difficulty: 'Beginner' },
    { topic: 'Digital Marketing', difficulty: 'Intermediate' },
    { topic: 'Data Science', difficulty: 'Advanced' },
    { topic: 'Graphic Design', difficulty: 'Beginner' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🎨 Generating logo for: ${testCase.topic} (${testCase.difficulty})`);
      
      const startTime = Date.now();
      const logoUrl = await generateCourseLogo(testCase.topic, testCase.difficulty, testCase.topic);
      const endTime = Date.now();
      
      console.log(`✅ Success! Generated in ${endTime - startTime}ms`);
      console.log(`📸 Logo URL: ${logoUrl}`);
      
      // Basic URL validation
      if (logoUrl.startsWith('http')) {
        console.log('✅ Valid URL format');
      } else {
        console.log('⚠️  Non-HTTP URL (possibly fallback)');
      }
      
    } catch (error) {
      console.error(`❌ Failed to generate logo for ${testCase.topic}:`, error.message);
    }
  }
  
  console.log('\n🏁 Test completed!');
  console.log('\nNotes:');
  console.log('- If using USE_MOCK_OPENAI=true, you\'ll see placeholder URLs');
  console.log('- If OpenAI API is configured, you\'ll see actual generated image URLs');
  console.log('- Check console logs for detailed API interaction information');
}

// Run the test
if (require.main === module) {
  testLogoGeneration().catch(console.error);
}

module.exports = { testLogoGeneration }; 