const router = require('express').Router();
const Guest = require('../models/Guest');
const { verifyToken, verifyRole } = require('../middleware/auth');
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// CREATE GUEST
router.post('/', verifyToken, verifyRole('Admin', 'Front Office'), upload.single('passportCopy'), async (req, res) => {
    try {
        const newGuest = new Guest({
            ...req.body,
            passportCopyUrl: req.file ? req.file.path : null
        });
        const savedGuest = await newGuest.save();
        res.status(201).json(savedGuest);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// GET ALL GUESTS
router.get('/', verifyToken, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'Admin' && req.user.hotelBranch !== 'All') {
            filter.hotelBranch = req.user.hotelBranch;
        }
        const guests = await Guest.find(filter);
        res.status(200).json(guests);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET DASHBOARD STATS
router.get('/stats', verifyToken, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'Admin' && req.user.hotelBranch !== 'All') {
            filter.hotelBranch = req.user.hotelBranch;
        }

        const totalGuests = await Guest.countDocuments(filter);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayArrivals = await Guest.countDocuments({ ...filter, arrivalDate: { $gte: today } });
        const todayDepartures = await Guest.countDocuments({ ...filter, departureDate: { $gte: today } });

        // This month birthdays
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Revenue
        const guests = await Guest.find(filter);
        const totalRevenue = guests.reduce((acc, curr) => acc + curr.totalAmount, 0);

        res.status(200).json({
            totalGuests,
            todayArrivals,
            todayDepartures,
            totalRevenue,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// GET GUEST
router.get('/find/:id', verifyToken, async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        res.status(200).json(guest);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE GUEST
router.put('/:id', verifyToken, verifyRole('Admin', 'Front Office'), async (req, res) => {
    try {
        const updatedGuest = await Guest.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedGuest);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE GUEST
router.delete('/:id', verifyToken, verifyRole('Admin'), async (req, res) => {
    try {
        await Guest.findByIdAndDelete(req.params.id);
        res.status(200).json("Guest has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
