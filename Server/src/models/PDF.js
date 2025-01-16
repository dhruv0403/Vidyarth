// models/PDF.js
const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  content_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  file_path: { type: String, required: true }, // Path to the uploaded PDF
  metadata: {
    size: { type: String, required: false }, // File size
    author: { type: String, required: false }, // PDF author
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PDF', pdfSchema);
