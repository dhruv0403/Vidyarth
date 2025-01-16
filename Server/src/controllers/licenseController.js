const License = require('../models/License');
const User = require('../models/User');
const { generateUniqueLicenseId } = require('../utils/licenseUtils');

// Controller: Assign a license to a student
const assignLicense = async (req, res) => {
  const { userId, courseId, expiryDate } = req.body;

  try {
    // Validate input
    if (!userId || !courseId) {
      return res.status(400).json({ message: 'User ID and Course ID are required' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new license
    const license = await License.create({
      license_id: generateUniqueLicenseId(),
      assigned_to: userId,
      course_id: courseId,
      status: 'active',
      expiry_date: expiryDate || null,
    });

    res.status(201).json({ message: 'License assigned successfully', license });
  } catch (error) {
    res.status(500).json({ message: 'Server error while assigning license', error: error.message });
  }
};

// Controller: View all licenses
const viewLicenses = async (req, res) => {
  try {
    const licenses = await License.find().populate('assigned_to', 'name email');
    res.status(200).json({ licenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching licenses', error: error.message });
  }
};

// Controller: Deactivate or reassign a license
const deactivateLicense = async (req, res) => {
  const { licenseId, newUserId } = req.body;

  try {
    // Find the license
    const license = await License.findOne({ license_id: licenseId });
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }

    // Deactivate or reassign the license
    if (newUserId) {
      const user = await User.findById(newUserId);
      if (!user) {
        return res.status(404).json({ message: 'New user not found' });
      }
      license.assigned_to = newUserId;
    } else {
      license.status = 'inactive';
    }

    await license.save();
    res.status(200).json({ message: 'License updated successfully', license });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating license', error: error.message });
  }
};

module.exports = { assignLicense, viewLicenses, deactivateLicense };
