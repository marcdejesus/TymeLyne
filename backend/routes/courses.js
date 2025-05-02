const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

// Public routes - accessible without authentication
router.get('/', courseController.getCourses);

// Protected routes - require authentication
router.post('/generate', protect, courseController.generateCourse);
router.get('/user/courses', protect, courseController.getUserCourses);
router.get('/:id', protect, courseController.getCourseById);
router.put('/:id', protect, courseController.updateCourse);
router.delete('/:id', protect, courseController.deleteCourse);
router.post('/:courseId/section/:sectionId/complete', protect, courseController.updateSectionCompletion);

module.exports = router; 