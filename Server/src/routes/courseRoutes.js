const express = require('express');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { createCourse, listCourses,getCourseById,getCourseModulesAndLessons } = require('../controllers/courseController');

const router = express.Router();

// Create a new course
router.post('/', verifyToken, authorizeRoles('Admin'), createCourse);

// List all courses
router.get('/', verifyToken, authorizeRoles('Admin'), listCourses);

// Get course by ID
router.get('/:id', verifyToken, getCourseById);

router.get('/:course_id/modules-lessons', verifyToken, getCourseModulesAndLessons);


module.exports = router;
