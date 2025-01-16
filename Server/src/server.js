const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require("./routes/adminRoutes");
const roleRoutes = require('./routes/roleRoutes');
const learnerRoutes = require("./routes/learnerRoutes")
const licenseRoutes = require('./routes/licenseRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const scormRoutes = require('./routes/scormRoutes');
const progressRoutes = require('./routes/progressRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');
const lessonRoutes = require("./routes/lessonRoutes")
const contentRoutes = require("./routes/contentRoutes");
const testRoutes = require("./routes/testRoutes")
const dashboardRoutes = require("./routes/adminDashboard.js")
const cors = require('cors');
const path = require('path');
dotenv.config();
const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the directory for EJS templates

// Serve static SCORM files
app.use('/public/scorm-content', express.static(path.join(__dirname, '../public/scorm-content')));



// Connect to DB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use("/api/learner", learnerRoutes)
app.use("/api/admin", adminRoutes)
app.use('/api/roles', roleRoutes);
app.use('/api/admin', licenseRoutes);
app.use('/api/scorm', scormRoutes);
// Add routes
app.use('/api/courses', courseRoutes);
app.use('/api/admin/modules', moduleRoutes);
app.use('/api/admin/scorm', scormRoutes);
app.use('/api/scorm/progress', progressRoutes);
app.use('/api/student', studentDashboardRoutes);
app.use("/api/lesson",lessonRoutes)
app.use("/api/content",contentRoutes)
app.use("/api/test",testRoutes);
app.use("/api/dashboard",dashboardRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
