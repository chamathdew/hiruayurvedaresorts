const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hiru_resorts')
    .then(async () => {
        console.log('Connected to MongoDB');

        const branches = [
            { username: 'villa', password: 'password', role: 'Front Office', hotelBranch: 'Hiru Villa' },
            { username: 'om', password: 'password', role: 'Front Office', hotelBranch: 'Hiru Om' },
            { username: 'mudhra', password: 'password', role: 'Front Office', hotelBranch: 'Hiru Mudhra' },
            { username: 'aadya', password: 'password', role: 'Front Office', hotelBranch: 'Hiru Aadya' },
        ];

        for (const branch of branches) {
            const existingUser = await User.findOne({ username: branch.username });
            if (!existingUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(branch.password, salt);

                const newUser = new User({
                    username: branch.username,
                    password: hashedPassword,
                    role: branch.role,
                    hotelBranch: branch.hotelBranch
                });

                await newUser.save();
                console.log(`User created: ${branch.username} | Branch: ${branch.hotelBranch}`);
            } else {
                console.log(`User already exists: ${branch.username}`);
            }
        }

        console.log("All branch users checked/created successfully.");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error(err);
        mongoose.connection.close();
    });
