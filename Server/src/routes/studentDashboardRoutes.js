const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getAssignedCourses,
  launchSCORMPackage,
  getCourseProgress,
} = require('../controllers/studentDashboardController');

const router = express.Router();

// List assigned courses
router.get('/courses', verifyToken, getAssignedCourses);

// Launch SCORM package
router.get('/scorm/:moduleId/launch', verifyToken, launchSCORMPackage);

// View course progress
router.get('/progress/:courseId', verifyToken, getCourseProgress);

module.exports = router;
