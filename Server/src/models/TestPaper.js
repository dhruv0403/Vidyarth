const mongoose = require('mongoose');

const testPaperSchema = new mongoose.Schema({
  content_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String }, // Optional for subjective questions
      type: { type: String, enum: ['MCQ', 'Subjective'], required: true },
    },
  ],
  totalMarks: { type: Number, required: true },
  timeLimit: { type: Number }, // In minutes
  maxAttempts: { type: Number, default: 1 }, // Finite attempts
  metadata: {
    description: { type: String },
    author: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('TestPaper', testPaperSchema);
