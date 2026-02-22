const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    nationality: { type: String },
    passportNumber: { type: String },
    passportCopyUrl: { type: String }, // path to the uploaded file
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contactNumber: { type: String },
    email: { type: String },
    hotelBranch: {
        type: String,
        required: true,
        enum: ['Hiru Villa', 'Hiru Om', 'Hiru Mudhra', 'Hiru Aadya']
    },
    roomNumber: { type: String },
    arrivalDate: { type: Date },
    departureDate: { type: Date },
    treatmentPackage: { type: String },
    specialNotes: { type: String },
    paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
    totalAmount: { type: Number, default: 0 },
    advancePayment: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
}, { timestamps: true });

guestSchema.pre('save', function (next) {
    this.balance = this.totalAmount - this.advancePayment;
    if (this.balance <= 0 && this.totalAmount > 0) {
        this.paymentStatus = 'Paid';
    } else if (this.advancePayment > 0) {
        this.paymentStatus = 'Partial';
    }
    next();
});

module.exports = mongoose.model('Guest', guestSchema);
