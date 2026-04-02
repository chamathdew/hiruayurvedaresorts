const router = require('express').Router();
const CCPayment = require('../models/CCPayment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { verifyToken, verifyRole } = require('../middleware/auth');

// ADD CC PAYMENT
router.post('/', verifyToken, verifyRole('Admin', 'Front Office'), async (req, res) => {
    try {
        console.log("New CC Payment Request Received:", req.body);
        
        // Ensure numbers are Numbers
        const paymentData = {
            ...req.body,
            paymentAmount: parseFloat(req.body.paymentAmount),
            commission: parseFloat(req.body.commission),
            totalAmount: parseFloat(req.body.totalAmount),
            enteredBy: req.user.id
        };

        const newPayment = new CCPayment(paymentData);
        const savedPayment = await newPayment.save();
        console.log("CC Payment Saved Successfully:", savedPayment._id);

        // Fetch user because username is missing from token
        const enteringUser = await User.findById(req.user.id);

        // Notify Admin and Accounts users
        const adminAndAccounts = await User.find({ 
            $or: [{ role: 'Admin' }, { role: 'Accounts' }] 
        });

        const notifications = adminAndAccounts.map(user => ({
            userId: user._id,
            type: 'CC_PAYMENT_ADDED',
            message: `New CC Payment of Rs. ${req.body.paymentAmount} added by ${enteringUser?.username || 'User'} for ${req.body.hotelBranch} (${req.body.bank})`,
            paymentId: savedPayment._id
        }));

        await Notification.insertMany(notifications);
        console.log(`Sent ${notifications.length} notifications.`);

        res.status(201).json(savedPayment);
    } catch (err) {
        console.error("ERROR ADDING CC PAYMENT:", err);
        res.status(500).json({ 
            message: "Server error while saving payment.", 
            error: err.message || err.toString() 
        });
    }
});

// GET ALL CC PAYMENTS
router.get('/', verifyToken, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'Admin' && req.user.role !== 'Accounts' && req.user.hotelBranch !== 'All') {
            filter.hotelBranch = req.user.hotelBranch;
        }
        
        // Populate enteredBy (user)
        const payments = await CCPayment.find(filter)
            .populate('enteredBy', 'username')
            .sort({ date: -1 });

        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE CC PAYMENT
router.delete('/:id', verifyToken, verifyRole('Admin'), async (req, res) => {
    try {
        await CCPayment.findByIdAndDelete(req.params.id);
        res.status(200).json("Payment has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
