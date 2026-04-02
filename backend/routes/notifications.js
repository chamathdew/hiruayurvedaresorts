const router = require('express').Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

// GET NOTIFICATIONS FOR LOGGED IN USER
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json(err);
    }
});

// MARK NOTIFICATION AS READ
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const updated = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json(err);
    }
});

// MARK ALL AS READ
router.put('/read-all', verifyToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json("All notifications read");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
