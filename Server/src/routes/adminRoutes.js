const express = require('express');
const multer = require('multer');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { importStudents,addUser,listLearners ,listUsers} = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Multer for file upload handling

// Admin-only route to add a user
router.post('/add-user', verifyToken, authorizeRoles('Admin'), addUser);
// Bulk import students
router.post('/import-students', verifyToken, authorizeRoles('Admin'), upload.single('file'), importStudents);

router.get('/students', verifyToken, authorizeRoles('Admin'), listLearners);

// Fetch all users
router.get('/users', verifyToken, authorizeRoles('Admin'), listUsers);


module.exports = router;
