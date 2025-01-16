const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const { updateProgress, getProgress } = require('../controllers/progressController');
const { trackProgress } = require('../controllers/scormRuntimeController');

const router = express.Router();

// Update progress
router.post('/', verifyToken, updateProgress);

// Get progress
router.get('/:moduleId', verifyToken, getProgress);
// Track SCORM runtime data
router.post('/track', verifyToken, trackProgress);

module.exports = router;
