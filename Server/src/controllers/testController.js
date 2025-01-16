const TestPaper = require('../models/TestPaper');
const TestAttempt = require('../models/TestAttempt');
const Content = require('../models/Content');
const Lesson = require('../models/Lesson');


// Start Test
const startTest = async (req, res) => {
  const { test_id } = req.body;
  const student_id = req.user._id;
  console.log("Fine");
  
  try {
    const testPaper = await TestPaper.findById(test_id);
    
    
    if (!testPaper) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    const attemptCount = await TestAttempt.countDocuments({ student_id, test_id });
    
    console.log(attemptCount,testPaper.maxAttempts)
    if (attemptCount >= testPaper.maxAttempts) {
      return res.status(403).json({ message: 'No attempts remaining.' });
    }

    const attempt = new TestAttempt({
      student_id,
      test_id,
      startTime: new Date(),
      status: 'In Progress',
    });
    await attempt.save();

    res.status(201).json({
      message: 'Test started successfully', attempt, timeLimit: testPaper.timeLimit
    });
  } catch (error) {
    console.error('Error starting test:', error.message);
    res.status(500).json({ message: 'Server error while starting test.', error: error.message });
  }
};

const startTestByLesson = async (req, res) => {
  const { lesson_id} = req.body;
  const student_id = req.user._id;

  try {
    // Step 1: Fetch associated content for the lesson
    const content = await Content.findOne({ lesson_id, content_type: 'TestPaper' });
    if (!content) {
      return res.status(404).json({ message: 'No test paper found for this lesson.' });
    }

    // Step 2: Fetch the test paper
    const testPaper = await TestPaper.findOne({ content_id: content._id });
    if (!testPaper) {
      return res.status(404).json({ message: 'Test paper not found.' });
    }

    // Step 3: Check remaining attempts
    const attemptCount = await TestAttempt.countDocuments({ student_id, test_id: testPaper._id });
    if (attemptCount >= testPaper.maxAttempts) {
      return res.status(403).json({ message: 'No attempts remaining for this test.' });
    }

    // Step 4: Create a new test attempt
    const attempt = new TestAttempt({
      student_id,
      test_id: testPaper._id,
      startTime: new Date(),
      status: 'In Progress',
    });
    await attempt.save();

    // Step 5: Include test details in the response
    res.status(201).json({
      message: 'Test started successfully',
      attempt: {
        attempt_id: attempt._id,
        startTime: attempt.startTime,
        status: attempt.status,
      },
      test: {
        description: testPaper.metadata.description,
        timeLimit: testPaper.timeLimit,
        totalMarks: testPaper.totalMarks,
        questions: testPaper.questions.map((question) => ({
          question_id: question._id,
          question: question.question,
          options: question.type === 'MCQ' ? question.options : undefined, // Include options only for MCQs
          type: question.type,
        })),
      },
    });
  } catch (error) {
    console.error('Error starting test:', error.message);
    res.status(500).json({ message: 'Server error while starting test.', error: error.message });
  }
};

const fetchTestDetailsByContent = async (req, res) => {
  const { content_id } = req.params;
  const student_id = req.user._id; // Extracted from JWT

  try {
    // Fetch the test paper
    const testPaper = await TestPaper.findOne({ content_id });
    if (!testPaper) {
      return res.status(404).json({ message: 'Test paper not found.' });
    }

    // Fetch all attempts by the current user
    const attempts = await TestAttempt.find({ test_id: testPaper._id, student_id });

    res.status(200).json({
      test: {
        id: testPaper._id,
        description: testPaper.metadata.description,
        totalMarks: testPaper.totalMarks,
        timeLimit: testPaper.timeLimit,
        maxAttempts: testPaper.maxAttempts,
        questions: testPaper.questions.map((question) => ({
          question_id: question._id,
          question: question.question,
          options: question.type === 'MCQ' ? question.options : undefined,
          type: question.type,
        })),
      },
      attempts,
    });
  } catch (error) {
    console.error('Error fetching test details:', error.message);
    res.status(500).json({ message: 'Server error while fetching test details.', error: error.message });
  }
};

const fetchTestDetailsByAttempt = async (req, res) => {
  const { attempt_id } = req.params;

  try {
    // Fetch the test attempt
    const attempt = await TestAttempt.findById(attempt_id).populate('test_id');
    if (!attempt) {
      return res.status(404).json({ message: 'Test attempt not found.' });
    }

    // Fetch the associated test paper
    const testPaper = await TestPaper.findById(attempt.test_id);
    if (!testPaper) {
      return res.status(404).json({ message: 'Test paper not found.' });
    }

    res.status(200).json({
      attempt: {
        id: attempt._id,
        status: attempt.status,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        score: attempt.score,
        responses: attempt.responses,
      },
      test: {
        id: testPaper._id,
        description: testPaper.metadata.description,
        totalMarks: testPaper.totalMarks,
        timeLimit: testPaper.timeLimit,
        maxAttempts: testPaper.maxAttempts,
        questions: testPaper.questions.map((question) => ({
          question_id: question._id,
          question: question.question,
          options: question.type === 'MCQ' ? question.options : undefined,
          type: question.type,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching test details by attempt:', error.message);
    res.status(500).json({ message: 'Server error while fetching test details by attempt.', error: error.message });
  }
};
const fetchQuizResult = async (req, res) => {
  const { attempt_id } = req.params;

  try {
    // Fetch the test attempt
    const attempt = await TestAttempt.findById(attempt_id).populate('test_id');
    if (!attempt) {
      return res.status(404).json({ message: 'Test attempt not found.' });
    }

    // Fetch the associated test paper
    const testPaper = await TestPaper.findById(attempt.test_id);
    if (!testPaper) {
      return res.status(404).json({ message: 'Test paper not found.' });
    }

    // Combine test details with attempt responses
    const detailedQuestions = testPaper.questions.map((question) => {
      const userResponse = attempt.responses.find((response) => response.question_id.toString() === question._id.toString());
      return {
        question_id: question._id,
        question: question.question,
        options: question.type === 'MCQ' ? question.options : undefined,
        type: question.type,
        correctAnswer: question.correctAnswer || null, // Include correct answer
        userResponse: userResponse ? userResponse.response : null, // Include user's response
        isCorrect: userResponse && userResponse.response === question.correctAnswer, // Determine if the response is correct
      };
    });

    // Return the full details
    res.status(200).json({
      attempt: {
        id: attempt._id,
        status: attempt.status,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        score: attempt.score,
        responses: attempt.responses,
      },
      test: {
        id: testPaper._id,
        description: testPaper.metadata.description,
        totalMarks: testPaper.totalMarks,
        timeLimit: testPaper.timeLimit,
        maxAttempts: testPaper.maxAttempts,
        questions: detailedQuestions, // Return detailed questions with user responses and correct answers
      },
    });
  } catch (error) {
    console.error('Error fetching quiz result:', error.message);
    res.status(500).json({ message: 'Server error while fetching quiz result.', error: error.message });
  }
};

// Submit Test
const submitTest = async (req, res) => {
  const { attempt_id, responses } = req.body;

  try {
    const attempt = await TestAttempt.findById(attempt_id).populate('test_id');
    if (!attempt || attempt.status !== 'In Progress') {
      return res.status(400).json({ message: 'Invalid or completed test attempt.' });
    }

    const testPaper = await TestPaper.findById(attempt.test_id);
    let score = 0;

    responses.forEach((response) => {
      const question = testPaper.questions.find(q => q._id.toString() === response.question_id);
      if (question && question.type === 'MCQ' && question.correctAnswer === response.response) {
        score += testPaper.totalMarks / testPaper.questions.length;
      }
    });

    attempt.responses = responses;
    attempt.score = score;
    attempt.status = 'Completed';
    attempt.endTime = new Date();
    await attempt.save();

    res.status(200).json({ message: 'Test submitted successfully', score });
  } catch (error) {
    console.error('Error submitting test:', error.message);
    res.status(500).json({ message: 'Server error while submitting test.', error: error.message });
  }
};

// Get Remaining Time
const getRemainingTime = async (req, res) => {
  const { attempt_id } = req.params;

  try {
    const attempt = await TestAttempt.findById(attempt_id).populate('test_id');
    if (!attempt) {
      return res.status(404).json({ message: 'Test attempt not found.' });
    }

    const elapsedTime = Math.floor((Date.now() - new Date(attempt.startTime)) / 1000); // in seconds
    const remainingTime = Math.max(attempt.test_id.timeLimit * 60 - elapsedTime, 0);

    res.status(200).json({ remainingTime });
  } catch (error) {
    console.error('Error calculating remaining time:', error.message);
    res.status(500).json({ message: 'Server error while calculating remaining time', error: error.message });
  }
};



const uploadTestPaper = async (req, res) => {
  const { lesson_id, description, author, questions, totalMarks, timeLimit } = req.body;

  try {
    // Step 1: Validate the lesson
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions are required for the test paper.' });
    }

    // Step 2: Create Content entry
    const content = new Content({
      lesson_id,
      content_type: 'TestPaper',
      metadata: { description },
    });
    await content.save();

    // Step 3: Create Test Paper entry
    const testPaper = new TestPaper({
      content_id: content._id,
      questions,
      totalMarks,
      timeLimit,
      metadata: {
        description,
        author: author || 'Unknown',
      },
    });
    await testPaper.save();

    res.status(201).json({ message: 'Test paper uploaded successfully', content, testPaper });
  } catch (error) {
    console.error('Error uploading test paper:', error.message);
    res.status(500).json({ message: 'Server error while uploading test paper', error: error.message });
  }
};




module.exports = { startTest, submitTest, getRemainingTime, uploadTestPaper ,startTestByLesson,fetchTestDetailsByAttempt,fetchTestDetailsByContent,fetchQuizResult};
