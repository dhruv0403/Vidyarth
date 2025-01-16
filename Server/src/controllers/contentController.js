const Content = require('../models/Content');
const Lesson = require("../models/Lesson");
const fs = require('fs');
const path = require('path');
const SCORMPackage = require('../models/ScormPackage');
const { uploadSCORMPackage } = require('../controllers/scormController');
const PDF = require('../models/PDF');
const {uploadTestPaper} = require("./testController")


const createContent = async (req, res) => {
  const { lesson_id, content_type, file_path, metadata } = req.body;

  try {
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const content = new Content({ lesson_id, content_type, file_path, metadata });
    await content.save();
    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    res.status(500).json({ message: 'Error creating content', error: error.message });
  }
};

const uploadContent = async (req, res) => {
  const { content_type } = req.body;

  try {
    switch (content_type) {
      case 'PDF':
        await uploadPDF(req, res);
        break;
      case 'SCORM':
        await uploadSCORMPackage(req, res);
        break;
      case 'TestPaper':
        await uploadTestPaper(req, res);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported content type.' });
    }
  } catch (error) {
    console.error(`Error uploading ${content_type}:`, error.message);
    res.status(500).json({ message: 'Server error while uploading content', error: error.message });
  }
};

const getContentById = async (req, res) => {
  const { id } = req.params;

  try {
    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }
    res.status(200).json({ content });
  } catch (error) {
    console.error('Error fetching content:', error.message);
    res.status(500).json({ message: 'Server error while fetching content', error: error.message });
  }
};

const getContentByLesson = async (req, res) => {
  const { lesson_id } = req.params;

  try {
    const content = await Content.find({ lesson_id });
    if (!content || content.length === 0) {
      return res.status(404).json({ message: 'No content found for this lesson.' });
    }
    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

const uploadPDF = async (req, res) => {
  const { lesson_id, description, author } = req.body;
  const file = req.file; // Assuming a file upload middleware is used.

  try {
    // Validate the lesson
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    // Step 1: Create Content entry
    const content = new Content({
      lesson_id,
      content_type: 'PDF',
      metadata: { description },
    });
    await content.save();

    // Step 2: Create PDF entry linked to Content
    const pdf = new PDF({
      content_id: content._id,
      file_path: `/uploads/${file.filename}`, // Assuming uploads are stored in `/uploads`
      metadata: {
        size: file.size,
        author: author || 'Unknown',
      },
    });
    await pdf.save();

    res.status(201).json({ message: 'PDF uploaded successfully', content, pdf });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading PDF', error: error.message });
  }
};

const runContent = async (req, res) => {
  const { lesson_id } = req.params;

  try {
    // Fetch content entry linked to the lesson
    const content = await Content.findOne({ lesson_id });
    if (!content) {
      return res.status(404).json({ message: 'No content found for this lesson.' });
    }

    let contentDetails;

    // Fetch specific content details based on the type
    switch (content.content_type) {
      case 'PDF':
        contentDetails = await PDF.findOne({ content_id: content._id });
        break;

      case 'SCORM':
        contentDetails = await SCORM.findOne({ content_id: content._id });
        break;

      case 'TestPaper':
        contentDetails = await TestPaper.findOne({ content_id: content._id });
        break;

      default:
        return res.status(400).json({ message: 'Unsupported content type.' });
    }

    if (!contentDetails) {
      return res.status(404).json({ message: `No details found for ${content.content_type} content.` });
    }

    // Send content details along with content metadata
    res.status(200).json({
      message: 'Content fetched successfully',
      contentType: content.content_type,
      contentMetadata: content.metadata,
      contentDetails,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

const deliverPdf = async (req, res) => {
  const { lesson_id } = req.params;

  try {
    // Fetch the content associated with the lesson
    const content = await Content.findOne({ lesson_id, content_type: 'PDF' });
    if (!content) {
      return res.status(404).json({ message: 'PDF content not found for this lesson.' });
    }

    // Fetch the PDF file path from the database
    const pdf = await PDF.findOne({ content_id: content._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF metadata not found.' });
    }

    // Resolve the full file path
    const filePath = path.join(__dirname, '../../uploads', path.basename(pdf.file_path));
    console.log('Resolved File Path:', filePath);

    // Verify the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found on server.' });
    }

    // Serve the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error fetching PDF:', error.message);
    res.status(500).json({ message: 'Server error while delivering PDF.', error: error.message });
  }
};



module.exports = { createContent, getContentById, getContentByLesson, uploadPDF, runContent, deliverPdf, uploadContent };
