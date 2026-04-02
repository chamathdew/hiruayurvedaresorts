const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiru_resorts';

mongoose.connect(uri)
  .then(async () => {
    const users = await User.find({}, { password: 0 }).lean();
    console.log('Users in DB:');
    console.dir(users, { depth: null });
    await mongoose.connection.close();
  })
  .catch((err) => {
    console.error('DB error:', err);
    process.exit(1);
  });
