const express = require('express');
const { createContent, getContentById, getContentByLesson, uploadPDF,runContent,deliverPdf,uploadContent } = require('../controllers/contentController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post(
    '/upload-pdf',
    verifyToken,
    authorizeRoles('Admin'),
    upload.single('file'),
    uploadPDF
);

router.post(
    '/upload-content',
    verifyToken,
    authorizeRoles('Admin'),
    upload.single('file'), // Single file upload
    uploadContent
  );

router.post('/', verifyToken, authorizeRoles('Admin'), createContent);
router.get('/:id', verifyToken, getContentById);
router.get('/lesson/:lesson_id', verifyToken, getContentByLesson);

router.get('/lesson/:lesson_id/run', verifyToken, runContent);
router.get("/pdf/:lesson_id",deliverPdf)

module.exports = router;
