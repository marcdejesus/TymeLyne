import api from '../utils/api';

/**
 * Get all publicly available courses
 * @returns {Promise} Promise object with courses array
 */
export const getCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error(error.response?.data?.message || 'Failed to load courses');
  }
};

/**
 * Get a specific course by ID
 * @param {number} id Course ID
 * @returns {Promise} Promise object with course data
 */
export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to load course');
  }
};

/**
 * Get courses created by the current user
 * @returns {Promise} Promise object with user's courses
 */
export const getMyCourses = async () => {
  try {
    const response = await api.get('/courses/user/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching my courses:', error);
    throw new Error(error.response?.data?.message || 'Failed to load your courses');
  }
};

/**
 * Create a new course using AI generation
 * @param {Object} courseData Course generation parameters
 * @param {string} courseData.topic Course topic
 * @param {string} courseData.difficulty Difficulty level ('Beginner', 'Intermediate', 'Advanced')
 * @param {number} courseData.sectionsCount Number of sections to generate
 * @returns {Promise} Promise object with created course
 */
export const createCourse = async (courseData) => {
  try {
    console.log('Generating course with data:', courseData);
    const response = await api.post('/courses/generate', courseData);
    return response.data;
  } catch (error) {
    console.error('Error generating course:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate course');
  }
};

/**
 * Update an existing course
 * @param {number} id Course ID
 * @param {Object} updatedData Updated course data
 * @returns {Promise} Promise object with updated course
 */
export const updateCourse = async (id, updatedData) => {
  try {
    const response = await api.put(`/courses/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating course ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to update course');
  }
};

/**
 * Delete a course
 * @param {number} id Course ID to delete
 * @returns {Promise} Promise object with success message
 */
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting course ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete course');
  }
};

/**
 * Update a section's completion status
 * @param {number} courseId Course ID
 * @param {string} sectionId Section ID
 * @param {boolean} isCompleted New completion status
 * @returns {Promise} Promise object with updated section
 */
export const updateSectionCompletion = async (courseId, sectionId, isCompleted) => {
  try {
    const response = await api.patch(`/courses/${courseId}/sections/${sectionId}/complete`, {
      isCompleted
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating section completion:`, error);
    throw new Error(error.response?.data?.message || 'Failed to update section completion status');
  }
};

/**
 * Add a course to user's current courses
 * @param {string|number} courseId The ID of the course to add
 * @returns {Promise} Promise object with status and message
 */
export const addToCurrentCourses = async (courseId) => {
  try {
    const response = await api.post('/profiles/courses', { courseId });
    return response.data;
  } catch (error) {
    console.error('Error adding course to current courses:', error);
    throw new Error(error.response?.data?.message || 'Failed to add course');
  }
};

/**
 * Remove a course from user's current courses
 * @param {string|number} courseId The ID of the course to remove
 * @returns {Promise} Promise object with status and message
 */
export const removeFromCurrentCourses = async (courseId) => {
  try {
    const response = await api.delete(`/profiles/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing course from current courses:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove course');
  }
}; 