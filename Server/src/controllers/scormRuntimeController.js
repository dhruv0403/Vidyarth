const Progress = require('../models/Progress');

const trackProgress = async (req, res) => {
    try {
      const { student_id, module_id, progress, completion_status, time_spent } = req.body;
  
      let progressEntry = await Progress.findOne({ student_id, module_id });
      if (progressEntry) {
        progressEntry.progress = progress;
        progressEntry.completion_status = completion_status;
        progressEntry.time_spent += time_spent;
        progressEntry.last_updated = Date.now();
      } else {
        progressEntry = new Progress({ student_id, module_id, progress, completion_status, time_spent });
      }
  
      await progressEntry.save();
      res.status(200).json({ message: 'Progress tracked successfully' });
    } catch (error) {
      console.error('Error tracking progress:', error.message);
      res.status(500).json({ message: 'Server error while tracking progress', error: error.message });
    }
  };
module.exports = { trackProgress };
