/**
 * Course Storage Service
 * 
 * This service handles storing and retrieving generated courses.
 * Uses AsyncStorage for persistent local storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  generatedCourses: 'tymelyne_generated_courses',
};

/**
 * Save a generated course to storage
 * 
 * @param {Object} course - The generated course data
 * @returns {Promise<void>}
 */
export const saveGeneratedCourse = async (course) => {
  try {
    // Get existing courses
    const existingCoursesJson = await AsyncStorage.getItem(STORAGE_KEYS.generatedCourses);
    const existingCourses = existingCoursesJson ? JSON.parse(existingCoursesJson) : [];
    
    // Add this course
    const updatedCourses = [...existingCourses, course];
    
    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEYS.generatedCourses, JSON.stringify(updatedCourses));
    
    console.log('Course saved successfully:', course.id);
    return course;
  } catch (error) {
    console.error('Error saving course:', error);
    throw error;
  }
};

/**
 * Get all generated courses from storage
 * 
 * @returns {Promise<Array>} - Array of saved courses
 */
export const getGeneratedCourses = async () => {
  try {
    const coursesJson = await AsyncStorage.getItem(STORAGE_KEYS.generatedCourses);
    return coursesJson ? JSON.parse(coursesJson) : [];
  } catch (error) {
    console.error('Error retrieving courses:', error);
    return [];
  }
};

/**
 * Get a specific generated course by ID
 * 
 * @param {string} courseId - The ID of the course to retrieve
 * @returns {Promise<Object|null>} - The course data or null if not found
 */
export const getGeneratedCourseById = async (courseId) => {
  try {
    const courses = await getGeneratedCourses();
    return courses.find(course => course.id === courseId) || null;
  } catch (error) {
    console.error('Error retrieving course by ID:', error);
    return null;
  }
};

/**
 * Delete a generated course
 * 
 * @param {string} courseId - The ID of the course to delete
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
export const deleteGeneratedCourse = async (courseId) => {
  try {
    const courses = await getGeneratedCourses();
    const filteredCourses = courses.filter(course => course.id !== courseId);
    
    if (filteredCourses.length === courses.length) {
      return false; // Course not found
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.generatedCourses, JSON.stringify(filteredCourses));
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
};

export default {
  saveGeneratedCourse,
  getGeneratedCourses,
  getGeneratedCourseById,
  deleteGeneratedCourse
}; 