const License = require('../models/License');
const Course = require('../models/Course');
const Module = require('../models/Module');
const SCORMPackage = require('../models/ScormPackage');
const Progress = require('../models/Progress');

// List assigned courses
const getAssignedCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch licenses for the student
    const licenses = await License.find({ student_id: studentId }).populate('course_id');

    const courses = await Promise.all(
      licenses.map(async (license) => {
        const course = license.course_id.toObject();
        const modules = await Module.find({ course_id: course._id }).lean();

        // Fetch progress for each module
        const modulesWithProgress = await Promise.all(
          modules.map(async (module) => {
            const progress = await Progress.findOne({ student_id: studentId, module_id: module._id });
            return {
              ...module,
              progress: progress ? progress.progress : 0,
              completion_status: progress ? progress.completion_status : 'not_started',
            };
          })
        );

        return { ...course, modules: modulesWithProgress };
      })
    );

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching assigned courses:', error.message);
    res.status(500).json({ message: 'Server error while fetching assigned courses', error: error.message });
  }
};

// Launch SCORM package
const launchSCORMPackage = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const scormPackage = await SCORMPackage.findOne({ module_id: moduleId });

    if (!scormPackage) {
      return res.status(404).json({ message: 'SCORM package not found' });
    }

    res.status(200).json({
      file_path: scormPackage.file_path,
      module_title: scormPackage.module_id.title,
    });
  } catch (error) {
    console.error('Error launching SCORM package:', error.message);
    res.status(500).json({ message: 'Server error while launching SCORM package', error: error.message });
  }
};

// View course progress
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const progressEntries = await Progress.find({ student_id: studentId, course_id: courseId });

    const totalProgress = progressEntries.reduce((sum, entry) => sum + entry.progress, 0);
    const averageProgress = totalProgress / progressEntries.length;

    res.status(200).json({
      course_id: courseId,
      progress: averageProgress,
      completion_status: averageProgress === 100 ? 'completed' : 'in_progress',
    });
  } catch (error) {
    console.error('Error fetching course progress:', error.message);
    res.status(500).json({ message: 'Server error while fetching course progress', error: error.message });
  }
};

module.exports = { getAssignedCourses, launchSCORMPackage, getCourseProgress };
