const License = require('../models/License');
const Course = require('../models/Course');
const Module = require('../models/Module');

// Fetch courses and modules assigned to the student
const getStudentAssignedCourses = async (req, res) => {
    try {
        const studentId = req.user.id; // Extracted from auth middleware

        // Find all active licenses assigned to the student
        const licenses = await License.find({ assigned_to: studentId, status: 'active' });

        if (!licenses || licenses.length === 0) {
            return res.status(404).json({ message: 'No courses assigned to this student.' });
        }

        // Extract unique course IDs from licenses
        const courseIds = licenses.map((license) => license.course_id);

        // Fetch courses based on course IDs
        const courses = await Course.find({ _id: { $in: courseIds }, status: 'active' });

        // Fetch modules for the courses
        const modules = await Module.find({ course_id: { $in: courseIds } }).sort({ order: 1 });

        // Group modules under their respective courses
        const response = courses.map((course) => {
            return {
                course,
                modules: modules.filter((module) => module.course_id.toString() === course._id.toString()),
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching student courses:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getStudentAssignedCourses};
