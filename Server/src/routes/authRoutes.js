const express = require('express');
const { login, register } = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/login', login);
router.post('/register', register); // Testing only

// Protected Routes (Admin Only)
router.get('/admin-dashboard', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

module.exports = router;
