const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  license_id: { type: String, required: true, unique: true }, // Unique ID for the license
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // User ID of the assigned student
  course_id: { type: String, required: true }, // Unique ID of the course
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // License status
  expiry_date: { type: Date, required: false }, // Optional expiration date
  created_at: { type: Date, default: Date.now }, // Creation timestamp
  updated_at: { type: Date, default: Date.now }, // Last update timestamp
});

module.exports = mongoose.model('License', licenseSchema);
