const User = require('../models/User');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const bcrypt = require('bcrypt'); // Import bcrypt


// Controller to add a new user with a specified role
const addUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate role
        const validRoles = ['Admin', 'Learner']; // Define valid roles
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Valid roles are: ${validRoles.join(', ')}` });
        }

        // Check if the email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create the user
        const newUser = await User.create({
            name,
            email,
            password, // Password hashing is handled in the User model
            role,
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding user' });
    }
};

// Controller: Import Students via CSV


const importStudents = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file field missing' });
    }
  
    const filePath = req.file.path;
  
    try {
      const usersToCreate = [];
      const errors = [];
  
      // Parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Normalize field names to lowercase
          const normalizedRow = {};
          Object.keys(row).forEach((key) => {
            normalizedRow[key.toLowerCase()] = row[key];
          });
  
          // Validate each row
          const missingFields = [];
          if (!normalizedRow.name) missingFields.push('name');
          if (!normalizedRow.email) missingFields.push('email');
          if (!normalizedRow.password) missingFields.push('password');
          if (!normalizedRow.country) missingFields.push('country');
  
          if (missingFields.length > 0) {
            errors.push({ row, message: `Missing required fields: ${missingFields.join(', ')}` });
          } else {
            usersToCreate.push({
              name: normalizedRow.name,
              email: normalizedRow.email,
              password: normalizedRow.password, // To be hashed later
              country: normalizedRow.country,
              phone: normalizedRow.phone || null,
              batch: normalizedRow.batch || null,
              company: normalizedRow.company || null,
              employee_id: normalizedRow['employee id'] || null,
              role: 'Learner',
            });
          }
        })
        .on('end', async () => {
          try {
            // Check for duplicates
            const existingEmails = (
              await User.find({ email: { $in: usersToCreate.map((u) => u.email) } })
            ).map((u) => u.email);
  
            const uniqueUsers = usersToCreate.filter((u) => !existingEmails.includes(u.email));
  
            // Hash passwords for unique users
            for (const user of uniqueUsers) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }
  
            // Insert valid users
            const createdUsers = await User.insertMany(uniqueUsers);
  
            // Remove the uploaded file
            fs.unlinkSync(filePath);
  
            res.status(201).json({
              message: 'Bulk import completed',
              total: usersToCreate.length,
              imported: createdUsers.length,
              errors,
            });
          } catch (error) {
            console.error('Error during user import:', error.message);
            res.status(500).json({ message: 'Server error during import', error: error.message });
          }
        });
    } catch (error) {
      console.error('Error processing CSV:', error.message);
      res.status(500).json({ message: 'Server error while processing the CSV', error: error.message });
    }
  };
  

// Fetch all learners
const listLearners = async (req, res) => {
    try {
      // Find users with the role of 'Learner'
      const learners = await User.find({ role: 'Learner' }, { name: 1, email: 1, _id: 1 });
      if (!learners || learners.length === 0) {
        return res.status(404).json({ message: 'No learners found.' });
      }
  
      res.status(200).json(learners);
    } catch (error) {
      console.error('Error fetching learners:', error.message);
      res.status(500).json({ message: 'Server error while fetching learners.', error: error.message });
    }
  };

  // Fetch all users
const listUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find({}, { name: 1, email: 1, role: 1, status: 1 });
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found.' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Server error while fetching users.', error: error.message });
    }
};

module.exports = { addUser, importStudents, listLearners, listUsers };

