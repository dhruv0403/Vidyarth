const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'Admin',
    });

    console.log('Admin user created:', adminUser);
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
