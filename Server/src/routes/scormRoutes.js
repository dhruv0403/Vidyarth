const express = require('express');
const multer = require('multer');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadSCORMPackage, listSCORMPackages, launchSCORMPackage,serveSCORMContent } = require('../controllers/scormController');

const router = express.Router();
const upload = multer({ dest: 'uploads/scorm/' }); // Directory for SCORM package uploads

// Upload a SCORM package
router.post('/upload', verifyToken, authorizeRoles('Admin'), upload.single('file'), uploadSCORMPackage);

// List all SCORM packages
router.get('/', verifyToken, authorizeRoles('Admin'), listSCORMPackages);

// Launch a SCORM package
router.get('/:lesson_id/launch',  launchSCORMPackage);


// Serve SCORM content files
// router.get('/scorm-content/:moduleId/*', verifyToken, authorizeRoles('Learner'), serveSCORMContent);

module.exports = router;
