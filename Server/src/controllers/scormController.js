const SCORMPackage = require('../models/ScormPackage');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const License = require('../models/License');
const Module = require('../models/Module');
const Content = require('../models/Content');
const Lesson = require('../models/Lesson');

const uploadSCORMPackage = async (req, res) => {
  try {
    const { lesson_id, description } = req.body;


    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const file = req.file;

    // Step 1: Validate Lesson
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    // Step 2: Create Upload Directory
    const uploadDir = `public/scorm-content/${lesson_id}`;
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Step 3: Extract SCORM Package
    fs.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: uploadDir }))
      .on('close', async () => {
        const manifestPath = path.join(uploadDir, 'imsmanifest.xml');
        if (!fs.existsSync(manifestPath)) {
          return res.status(400).json({ message: 'Invalid SCORM package: imsmanifest.xml missing' });
        }

        // Step 4: Create Content entry
        const content = new Content({
          lesson_id,
          content_type: 'SCORM',
          metadata: { description: 'SCORM Content' },
        });
        await content.save();

        // Step 5: Create SCORM Package Entry
        const scormPackage = new SCORMPackage({
          content_id: content._id,
          file_path: uploadDir,
          size: file.size,
        });
        await scormPackage.save();

        res.status(201).json({ message: 'SCORM package uploaded successfully', content, scormPackage });
      });
  } catch (error) {
    console.error('Error uploading SCORM package:', error.message);
    res.status(500).json({ message: 'Server error while uploading SCORM package', error: error.message });
  }
};


// List all SCORM packages
const listSCORMPackages = async (req, res) => {
  try {
    const packages = await SCORMPackage.find().populate('module_id', 'title');
    res.status(200).json({ packages });
  } catch (error) {
    console.error('Error listing SCORM packages:', error.message);
    res.status(500).json({ message: 'Server error while listing SCORM packages', error: error.message });
  }
};

const launchSCORMPackage = async (req, res) => {
  try {
    const { lesson_id } = req.params;

    // Step 1: Fetch Content Entry for SCORM
    const content = await Content.findOne({ lesson_id, content_type: 'SCORM' });
    if (!content) {
      return res.status(404).json({ message: 'No SCORM content found for this lesson.' });
    }
console.log(content);

    // Step 2: Fetch SCORM Package Details
    const scormPackage = await SCORMPackage.findOne({ content_id: content._id });
    console.log(scormPackage);
    
    if (!scormPackage) {
      return res.status(404).json({ message: 'SCORM package not found.' });
    }

    // Step 3: Verify SCORM Launch File
    const scormPath = path.join(scormPackage.file_path, 'index_lms.html');
    if (!fs.existsSync(scormPath)) {
      return res.status(404).json({ message: 'SCORM launch file not found.' });
    }

    // Step 4: Render SCORM Player
    res.render('scorm-player', { scormPath: `/public/scorm-content/${lesson_id}/index_lms.html` });
  } catch (error) {
    console.error('Error launching SCORM package:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





module.exports = { uploadSCORMPackage, listSCORMPackages, launchSCORMPackage };
