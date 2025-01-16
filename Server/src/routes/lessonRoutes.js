const express = require('express');
const { createLesson,listLessons } = require('../controllers/lessonController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('Admin'), createLesson);

router.get('/modules/:moduleId/', verifyToken, listLessons);


module.exports = router;
