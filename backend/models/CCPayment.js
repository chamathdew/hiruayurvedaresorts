const mongoose = require('mongoose');

const ccPaymentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    invoiceNo: { type: String, required: true },
    bank: { type: String, enum: ['HNB', 'NTB'], required: true },
    paymentAmount: { type: Number, required: true },
    commission: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    hotelBranch: {
        type: String,
        required: true,
        enum: ['Hiru Villa', 'Hiru Om', 'Hiru Mudhra', 'Hiru Aadya']
    },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Verified'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('CCPayment', ccPaymentSchema);
