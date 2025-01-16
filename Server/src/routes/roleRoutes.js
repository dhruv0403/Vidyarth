const express = require('express');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { getRoles, assignRole } = require('../controllers/roleController');

const router = express.Router();

// Fetch all available roles (Admin-only)
router.get('/roles', verifyToken, authorizeRoles('Admin'), getRoles);

// Assign a role to a user (Admin-only)
router.post('/assign-role', verifyToken, authorizeRoles('Admin'), assignRole);

module.exports = router;
