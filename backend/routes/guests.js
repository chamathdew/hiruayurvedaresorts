const router = require('express').Router();
const Guest = require('../models/Guest');
const { verifyToken, verifyRole } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const Tesseract = require('tesseract.js');

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

// EXTRACT DATA FROM HANDWRITTEN FORM OR PASSPORT USING TESSERACT.JS
router.post('/extract', verifyToken, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No document attached." });
        }

        const docType = req.body.docType || 'passport'; // 'passport' or 'form'

        // Run Tesseract OCR on the uploaded image
        const { data: { text } } = await Tesseract.recognize(
            req.file.path,
            'eng',
            { logger: m => console.log(m) }
        );

        let extractedData = {
            fullName: "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
            visaExpiryDate: "",
            email: "",
            contactNumber: "",
            remark: ""
        };

        // Basic Regex Extraction on the OCR text
        // Passport MRZ often looks like P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
        // And second line: L898902C36UTO7408122F1204159ZE184226B<<<<<10
        // We do a simple best-effort matching since free OCR outputs unstructured text

        // Attempt to find passport number (usually 8-9 uppercase alphanumeric characters)
        const passportMatch = text.match(/\b([A-Z0-9]{8,9})\b/);
        if (passportMatch) extractedData.passportNumber = passportMatch[1];

        // Match dates like YYYY-MM-DD, DD/MM/YYYY, etc.
        const dateMatch = text.match(/\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b/g);
        if (dateMatch && dateMatch.length > 0) {
            extractedData.dateOfBirth = dateMatch[0]; // Guess first date is DOB
            if (dateMatch.length > 1) {
                extractedData.visaExpiryDate = dateMatch[1];
            }
        }

        // Email match
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) extractedData.email = emailMatch[0];

        // Phone number match
        const phoneMatch = text.match(/\+?\d[\d -]{8,12}\d/);
        if (phoneMatch) extractedData.contactNumber = phoneMatch[0];

        // For fields we can't easily regex (like names and remarks), we can append the raw text to remark 
        // to help the user manually copy it over
        extractedData.remark = `[RAW OCR TEXT] -> ${text.substring(0, 300)}...`;

        // Delete the temporarily uploaded file used for extraction to save space
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            extractedData
        });

    } catch (err) {
        console.error("Extraction error:", err);
        // Clean up file if there's an error and it still exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Extraction Error: " + (err.message || err.toString()) });
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
