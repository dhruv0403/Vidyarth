const Module = require('../models/Module');

// Create a new module
const createModule = async (req, res) => {
  try {
    const { course_id, title, description, order } = req.body;

    const module = new Module({ course_id, title, description, order });
    await module.save();

    res.status(201).json({ message: 'Module created successfully', module });
  } catch (error) {
    console.error('Error creating module:', error.message);
    res.status(500).json({ message: 'Server error while creating module', error: error.message });
  }
};

// List all modules for a course
const listModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ course_id: courseId });
    res.status(200).json({ modules });
  } catch (error) {
    console.error('Error listing modules:', error.message);
    res.status(500).json({ message: 'Server error while listing modules', error: error.message });
  }
};

module.exports = { createModule, listModules };
