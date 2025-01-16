const express = require('express');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { getStudentAssignedCourses} = require('../controllers/learnerController');
const router = express.Router();

// Protected Route for Learners
router.get('/dashboard', verifyToken, authorizeRoles('Learner'), (req, res) => {
  res.json({ message: 'Welcome to the Learner Dashboard' });
});

// Route to fetch assigned courses for a student
router.get('/courses', verifyToken,getStudentAssignedCourses);

module.exports = router;
