const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Manager', 'Accounts', 'Front Office']
    },
    hotelBranch: {
        type: String,
        enum: ['Hiru Villa', 'Hiru Om', 'Hiru Mudhra', 'Hiru Aadya', 'All']
    }
});

module.exports = mongoose.model('User', userSchema);
