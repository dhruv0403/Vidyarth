const Lesson = require('../models/Lesson');
const Content = require("../models/Content")

const createLesson = async (req, res) => {
    const { module_id, title, description, order } = req.body;
  
    try {
      const lesson = new Lesson({ module_id, title, description, order });
      await lesson.save();
      res.status(201).json({ message: 'Lesson created successfully', lesson });
    } catch (error) {
      res.status(500).json({ message: 'Error creating lesson', error: error.message });
    }
  };
  
  const listLessons = async (req, res) => {
    const { moduleId } = req.params;
  
    try {
      // Fetch lessons for the given module
      const lessons = await Lesson.find({ module_id: moduleId }).sort({ order: 1 });
  
      if (!lessons || lessons.length === 0) {
        return res.status(404).json({ message: 'No lessons found for this module.' });
      }
  
      // Fetch content for each lesson and combine with lesson data
      const lessonsWithContent = await Promise.all(
        lessons.map(async (lesson) => {
          const content = await Content.findOne({ lesson_id: lesson._id });
          return {
            ...lesson.toObject(), // Convert Mongoose document to plain object
            content: content || null, // Add content if found
          };
        })
      );
  
      res.status(200).json({ lessons: lessonsWithContent });
    } catch (error) {
      console.error('Error fetching lessons with content:', error.message);
      res.status(500).json({ message: 'Server error while fetching lessons', error: error.message });
    }
  };
  
module.exports = { createLesson ,listLessons};
