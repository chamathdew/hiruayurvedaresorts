const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hiru_resorts')
    .then(async () => {
        console.log('Connected to MongoDB');

        const count = await User.countDocuments();
        if (count === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const admin = new User({
                username: 'admin',
                password: hashedPassword,
                role: 'Admin',
                hotelBranch: 'All'
            });

            await admin.save();
            console.log('Admin user created: admin / admin123');
        } else {
            console.log('Admin user already exists');
        }
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
        mongoose.connection.close();
    });
