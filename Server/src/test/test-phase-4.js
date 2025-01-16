const axios = require('axios');

// Base URL of your API
const BASE_URL = 'http://localhost:5000/api';

// Test Credentials
const credentials = {
  admin: { email: 'admin@example.com', password: 'securepassword' },
  student: { email: 'demo_learner@gmail.com', password: '123' },
};

// Store tokens
let ADMIN_TOKEN = null;
let STUDENT_TOKEN = null;

// Helper function to set headers
const headers = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Test Data
const testData = {
  course: {
    title: 'Test Course',
    description: 'A course for testing.',
    category: 'Testing',
    status: 'active',
    course_type: 'self-learning',
  },
  module: {
    title: 'Test Module',
    description: 'A module for testing.',
    order: 1,
  },
  lesson: {
    title: 'Test Lesson',
    description: 'A lesson for testing.',
    order: 1,
  },
  content: {
    content_type: 'PDF',
    file_path: '/test-files/test.pdf',
    metadata: { size: '1MB', author: 'Test Author' },
  },
};

// Function to login and retrieve tokens
const loginAndRetrieveToken = async (role) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, credentials[role]);
    console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} Token Retrieved`);
    return res.data.token;
  } catch (error) {
    console.error(`Failed to login as ${role}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

// Main Testing Function
const runTests = async () => {
  try {
    // Step 1: Login as Admin and Student
    ADMIN_TOKEN = await loginAndRetrieveToken('admin');
    STUDENT_TOKEN = await loginAndRetrieveToken('student');

    // Step 2: Create a Course
    const courseRes = await axios.post(`${BASE_URL}/courses`, testData.course, headers(ADMIN_TOKEN));
    console.log('Course Created:', courseRes.data);
    const courseId = courseRes.data._id;

    // Step 3: Create a Module
    const moduleData = { ...testData.module, course_id: courseId };
    const moduleRes = await axios.post(`${BASE_URL}/admin/modules`, moduleData, headers(ADMIN_TOKEN));
    console.log('Module Created:', moduleRes.data);
    const moduleId = moduleRes.data.module._id;

    // Step 4: Create a Lesson
    const lessonData = { ...testData.lesson, module_id: moduleId };
    const lessonRes = await axios.post(`${BASE_URL}/lesson`, lessonData, headers(ADMIN_TOKEN));
    console.log('Lesson Created:', lessonRes.data);
    const lessonId = lessonRes.data.lesson._id;
console.log(lessonId);

    // Step 5: Create Content for the Lesson
    const contentData = { ...testData.content, lesson_id: lessonId };
    const contentRes = await axios.post(`${BASE_URL}/content`, contentData, headers(ADMIN_TOKEN));
    console.log('Content Created:', contentRes.data);

    // Step 6: List Lessons under a Module
    const lessonsRes = await axios.get(`${BASE_URL}/lesson/modules/${moduleId}`, headers(ADMIN_TOKEN));
    console.log('Lessons in Module:', lessonsRes.data);

    // Step 7: Fetch Content by Lesson
    const contentFetchRes = await axios.get(`${BASE_URL}/content/lesson/${lessonId}`, headers(ADMIN_TOKEN));
    console.log('Content for Lesson:', contentFetchRes.data);

    // Step 8: Learner Navigation
    const learnerCoursesRes = await axios.get(`${BASE_URL}/learner/courses`, headers(STUDENT_TOKEN));
    console.log('Learner Courses:', learnerCoursesRes.data);

    // Step 9: Fetch Assigned Lessons
    const learnerLessonsRes = await axios.get(`${BASE_URL}/lesson/modules/${moduleId}`, headers(STUDENT_TOKEN));
    console.log('Learner Lessons:', learnerLessonsRes.data);

    // Step 10: Launch Content (if SCORM content)
    if (testData.content.content_type === 'SCORM') {
      const launchContentRes = await axios.get(`${BASE_URL}/student/scorm/${moduleId}/launch`, headers(STUDENT_TOKEN));
      console.log('Launch Content Response:', launchContentRes.data);
    }

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
};

runTests();
