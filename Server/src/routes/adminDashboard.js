const express = require('express');
const {
  getDashboardMetrics,
  getRecentUsers,
  getCoursesSummary,
  getTestSummary,
} = require('../controllers/adminDashboardController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Dashboard endpoint
router.get('/', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const [metrics, recentUsers, courses, tests] = await Promise.all([
      getDashboardMetrics(),
      getRecentUsers(),
      getCoursesSummary(),
      getTestSummary(),
    ]);

    res.status(200).json({ metrics, recentUsers, courses, tests });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error.message);
    res.status(500).json({ message: 'Server error while fetching dashboard data', error: error.message });
  }
});

module.exports = router;
