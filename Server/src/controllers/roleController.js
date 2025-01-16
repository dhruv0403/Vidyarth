const User = require('../models/User');

// Controller to fetch all available roles
const getRoles = (req, res) => {
  try {
    const roles = ['Admin', 'Learner']; // Add more roles if necessary
    res.status(200).json({ roles });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching roles' });
  }
};

// Controller to assign a role to a user
const assignRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    // Validate input
    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }

    // Validate role
    const validRoles = ['Admin', 'Learner']; // Define valid roles
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` });
    }

    // Find the user and update the role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'Role assigned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error while assigning role' });
  }
};

module.exports = { getRoles, assignRole };
