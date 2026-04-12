const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://chamathdew2026_db_user:xEV5cvPdMYsBsY0Q@cluster0.dfhdcbj.mongodb.net/hiru_resorts?retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    role: { type: String },
    hotelBranch: { type: String },
    profilePicture: { type: String }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function makeSuperAdmin() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const username = 'chamath';
        const password = '#Burnitdown2002#';
        const hashedPassword = await bcrypt.hash(password, 10);

        const update = {
            username: username,
            password: hashedPassword,
            role: 'Admin',
            hotelBranch: 'All'
        };

        const result = await User.findOneAndUpdate(
            { username: username },
            update,
            { upsert: true, new: true }
        );

        console.log('Successfully made chamath a Super Admin!');
        console.log(result);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

makeSuperAdmin();
