const Course = require('../models/Course');
const Module = require('../models/Module'); // For related modules
const Lesson = require('../models/Lesson');

// Fetch a course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the course by ID and populate related modules
    const course = await Course.findById(id).exec();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }


    // Fetch related modules and sort them by order (ascending)
    const modules = await Module.find({ course_id: id }).sort({ order: 1 }).exec();

    res.status(200).json({ course, modules });
  } catch (error) {
    console.error('Error fetching course by ID:', error.message);
    res.status(500).json({ message: 'Server error while fetching course', error: error.message });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  try {
    const { title, description, course_type, category, status, image_url } = req.body;

    const newCourse = new Course({
      title,
      description,
      course_type,
      category,
      status,
      image_url, // Save the image URL if provided
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error creating course:', error.message);
    res.status(500).json({ message: 'Server error while creating course', error: error.message });
  }
};

// List all courses
const listCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error listing courses:', error.message);
    res.status(500).json({ message: 'Server error while listing courses', error: error.message });
  }
};

const getCourseModulesAndLessons = async (req, res) => {
  const { course_id } = req.params;

  try {
    // Step 1: Fetch all modules of the course, sorted by order
    const modules = await Module.find({ course_id }).sort({ order: 1 });

    if (!modules || modules.length === 0) {
      return res.status(404).json({ message: 'No modules found for this course.' });
    }

    // Step 2: For each module, fetch its lessons and sort them by order
    const result = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({ module_id: module._id }).sort({ order: 1 });
        return {
          module_id: module._id,
          title: module.title,
          description: module.description,
          order: module.order,
          lessons: lessons.map((lesson) => ({
            lesson_id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
          })),
        };
      })
    );

    // Step 3: Respond with the structured data
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching modules and lessons:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createCourse, listCourses, getCourseById,getCourseModulesAndLessons };
