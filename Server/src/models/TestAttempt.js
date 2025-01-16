const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestPaper',
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  score: { type: Number },
  responses: [
    {
      question_id: mongoose.Schema.Types.ObjectId,
      response: String, // Chosen option or subjective answer
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
