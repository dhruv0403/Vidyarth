const User = require('../models/User');
const Course = require('../models/Course');
const TestPaper = require('../models/TestPaper');
const License = require('../models/License');

// Fetch dashboard metrics
const getDashboardMetrics = async () => {
  try {
    const [totalUsers, activeCourses, licenses, completedTests] = await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({ status: 'active' }),
      License.countDocuments({ status: 'active' }),
      TestPaper.countDocuments({ status: 'completed' }),
    ]);

    return {
      totalUsers,
      activeCourses,
      licenses,
      completedTests,
    };
  } catch (error) {
    throw new Error('Error fetching dashboard metrics: ' + error.message);
  }
};

// Fetch recent users
const getRecentUsers = async () => {
  try {
    return await User.find({}, { name: 1, email: 1, role: 1, _id: 1 })
      .sort({ created_at: -1 })
      .limit(5);
  } catch (error) {
    throw new Error('Error fetching recent users: ' + error.message);
  }
};

// Fetch course summaries
const getCoursesSummary = async () => {
  try {
    return await Course.find({}, { title: 1, status: 1, created_at: 1 });
  } catch (error) {
    throw new Error('Error fetching courses: ' + error.message);
  }
};

// Fetch test paper summaries
const getTestSummary = async () => {
  try {
    return await TestPaper.find({}, { title: 1, status: 1, totalMarks: 1 });
  } catch (error) {
    throw new Error('Error fetching tests: ' + error.message);
  }
};

module.exports = {
  getDashboardMetrics,
  getRecentUsers,
  getCoursesSummary,
  getTestSummary,
};
