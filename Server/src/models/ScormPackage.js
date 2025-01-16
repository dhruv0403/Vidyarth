const mongoose = require('mongoose');

const scormPackageSchema = new mongoose.Schema({
  file_path: { type: String, required: true }, // Path to the SCORM package file
  size: { type: Number, required: true }, // Size of the SCORM file in bytes
  content_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  upload_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SCORMPackage', scormPackageSchema);
