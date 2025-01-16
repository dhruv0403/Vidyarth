const Progress = require('../models/Progress');

// Update or create progress for a student in a module
const updateProgress = async (req, res) => {
  try {
    const { student_id, course_id, module_id, progress, completion_status, time_spent } = req.body;

    let progressEntry = await Progress.findOne({ student_id, module_id });

    if (progressEntry) {
      progressEntry.progress = progress;
      progressEntry.completion_status = completion_status;
      progressEntry.time_spent += time_spent;
      progressEntry.last_updated = Date.now();
    } else {
      progressEntry = new Progress({ student_id, course_id, module_id, progress, completion_status, time_spent });
    }

    await progressEntry.save();
    res.status(200).json({ message: 'Progress updated successfully', progress: progressEntry });
  } catch (error) {
    console.error('Error updating progress:', error.message);
    res.status(500).json({ message: 'Server error while updating progress', error: error.message });
  }
};

// Fetch progress for a student in a specific module
const getProgress = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const studentId = req.user.id; // Assuming user ID is added to the request object during authentication

    const progress = await Progress.findOne({ student_id: studentId, module_id: moduleId });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this module' });
    }

    res.status(200).json({ progress });
  } catch (error) {
    console.error('Error fetching progress:', error.message);
    res.status(500).json({ message: 'Server error while fetching progress', error: error.message });
  }
};

module.exports = { updateProgress, getProgress };
