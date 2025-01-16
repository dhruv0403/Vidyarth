const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  order: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lesson', lessonSchema);
