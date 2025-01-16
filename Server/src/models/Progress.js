const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  progress: { type: Number, default: 0 }, // Progress in percentage
  completion_status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  time_spent: { type: Number, default: 0 }, // Time in seconds
  last_updated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Progress', progressSchema);
