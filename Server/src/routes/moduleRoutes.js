const express = require('express');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { createModule, listModules } = require('../controllers/moduleController');

const router = express.Router();

// Create a new module for a course
router.post('/', verifyToken, authorizeRoles('Admin'), createModule);

// List all modules for a course
router.get('/:courseId', verifyToken, authorizeRoles('Admin'), listModules);

module.exports = router;
