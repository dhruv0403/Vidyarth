const express = require('express');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { assignLicense, viewLicenses, deactivateLicense } = require('../controllers/licenseController');

const router = express.Router();

// Assign a license to a student
router.post('/assign-license', verifyToken, authorizeRoles('Admin'), assignLicense);

// View all licenses
router.get('/licenses', verifyToken, authorizeRoles('Admin'), viewLicenses);

// Deactivate or reassign a license
router.post('/deactivate-license', verifyToken, authorizeRoles('Admin'), deactivateLicense);

module.exports = router;
