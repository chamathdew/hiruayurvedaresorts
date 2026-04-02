const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Targeted user (Admin or Accounts)
    type: { type: String, enum: ['CC_PAYMENT_ADDED'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CCPayment' } // Reference to the payment that triggered the notification
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
