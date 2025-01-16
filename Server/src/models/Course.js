const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course_type: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  // Add the optional field for image URL
  image_url: { type: String, required: false },
});

module.exports = mongoose.model('Course', courseSchema);
