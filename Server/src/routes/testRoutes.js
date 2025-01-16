const express = require('express');
const { startTest, submitTest, getRemainingTime,startTestByLesson,fetchTestDetailsByAttempt,fetchTestDetailsByContent,fetchQuizResult} = require('../controllers/testController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/start', verifyToken, startTest);
router.post('/submit', verifyToken, submitTest);
router.get('/:attempt_id/remaining-time', verifyToken, getRemainingTime);
router.post('/start-by-lesson', verifyToken, startTestByLesson);
router.get('/details/content/:content_id', verifyToken, fetchTestDetailsByContent);
router.get('/details/attempt/:attempt_id', verifyToken, fetchTestDetailsByAttempt);
router.get('/result/:attempt_id', verifyToken, fetchQuizResult);



module.exports = router;
