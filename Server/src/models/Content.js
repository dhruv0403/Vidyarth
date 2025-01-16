// models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  content_type: { type: String, enum: ['SCORM', 'PDF', 'TestPaper'], required: true },
  metadata: {
    description: { type: String, required: false }, // Optional metadata like description
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Content', contentSchema);
