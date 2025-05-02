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
 * @param {string|number} id Course ID (can be MongoDB _id or course_id)
 * @returns {Promise} Promise object with course data
 */
export const getCourseById = async (id) => {
  try {
    console.log(`Getting course with ID: ${id}`);
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    
    // Handle auth errors specifically
    if (error.response?.status === 401) {
      throw new Error('Authentication required to access this course');
    } else if (error.response?.status === 403) {
      throw new Error('Not authorized to access this course');
    }
    
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
 * @param {string|number} courseId Course ID (can be MongoDB _id or course_id)
 * @param {string} sectionId Section ID
 * @param {boolean} isCompleted New completion status
 * @returns {Promise} Promise object with updated section
 */
export const updateSectionCompletion = async (courseId, sectionId, isCompleted) => {
  try {
    console.log(`Updating section completion: courseId=${courseId}, sectionId=${sectionId}, isCompleted=${isCompleted}`);
    const response = await api.post(`/courses/${courseId}/section/${sectionId}/complete`, {
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
    // Ensure we have a valid courseId
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    // Convert to string to ensure consistent format
    const formattedCourseId = String(courseId);
    
    // Log detailed course ID info for debugging
    console.log('Attempting to remove course with ID:', {
      originalId: courseId,
      formattedId: formattedCourseId,
      idType: typeof courseId
    });
    
    // Call the API to remove the course
    const response = await api.delete(`/profiles/courses/${formattedCourseId}`);
    console.log('Successfully removed course:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error removing course from current courses:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    
    // Check for specific error code
    if (error.response?.status === 400) {
      throw new Error('Course not found in your current courses');
    }
    throw new Error(error.response?.data?.message || 'Failed to remove course');
  }
};

/**
 * Mark a course as completed and record it in the activity feed
 * @param {String} courseId - Course ID
 * @returns {Promise} Promise object with completion status
 */
export const completeCourse = async (courseId) => {
  try {
    // First mark the course as completed
    const response = await api.post(`/courses/${courseId}/complete`);
    
    // Then record the activity
    await api.post('/activity/course-completion', {
      courseId,
      xpEarned: response.data.xpEarned || 0
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error completing course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Mark a course section as completed and record it in the activity feed
 * @param {String} courseId - Course ID
 * @param {String} sectionId - Section ID
 * @returns {Promise} Promise object with completion status
 */
export const completeSection = async (courseId, sectionId) => {
  try {
    // First mark the section as completed
    const response = await api.post(`/courses/${courseId}/sections/${sectionId}/complete`);
    
    // Then record the activity
    await api.post('/activity/section-completion', {
      courseId,
      sectionId,
      xpEarned: response.data.xpEarned || 0
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error completing section ${sectionId} in course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Find the internal ID of a course in a user's current courses
 * @param {string|number} courseTitle Title of the course to look up
 * @returns {Promise} Promise object with the course internal ID
 */
export const findCourseInternalId = async (courseTitle) => {
  try {
    if (!courseTitle) {
      throw new Error('Course title is required');
    }
    
    // Get user's current courses
    const allCourses = await getMyCourses();
    
    // Find the course by title
    const course = allCourses.find(c => 
      (c.title && c.title.toLowerCase() === courseTitle.toLowerCase()) ||
      (c.course_name && c.course_name.toLowerCase() === courseTitle.toLowerCase())
    );
    
    if (!course) {
      throw new Error('Course not found with that title');
    }
    
    // Get all possible IDs
    const idInfo = {
      _id: course._id,
      course_id: course.course_id,
      title: course.title || course.course_name,
      internalId: course._id || course.course_id
    };
    
    console.log('Found course internal ID:', idInfo);
    
    return idInfo;
  } catch (error) {
    console.error('Error finding course internal ID:', error);
    throw error;
  }
};

/**
 * Remove a course from user's current courses by title lookup first
 * @param {string} courseTitle The title of the course to remove
 * @returns {Promise} Promise object with status and message
 */
export const removeFromCurrentCoursesByTitle = async (courseTitle) => {
  try {
    // Look up the course ID first
    const courseInfo = await findCourseInternalId(courseTitle);
    
    // Use the internal ID to remove the course
    return await removeFromCurrentCourses(courseInfo.internalId);
  } catch (error) {
    console.error('Error removing course by title:', error);
    throw error;
  }
};

export default {
  getCourses,
  getCourseById,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  updateSectionCompletion,
  addToCurrentCourses,
  removeFromCurrentCourses,
  completeCourse,
  completeSection,
  findCourseInternalId,
  removeFromCurrentCoursesByTitle
}; 