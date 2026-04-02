const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiru_resorts';

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB');
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin user already exists');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = new User({ username: 'admin', password: hashedPassword, role: 'Admin', hotelBranch: 'All' });
      await admin.save();
      console.log('Admin user created: admin / admin123');
    }
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error creating admin:', err);
    mongoose.connection.close();
  });
