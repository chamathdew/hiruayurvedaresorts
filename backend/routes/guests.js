const router = require('express').Router();
const Guest = require('../models/Guest');
const { verifyToken, verifyRole } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// EXTRACT DATA FROM HANDWRITTEN FORM OR PASSPORT USING GEMINI AI
router.post('/extract', verifyToken, upload.single('document'), async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "GEMINI_API_KEY is missing in server environment. Contact Admin." });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No document attached." });
        }

        const docType = req.body.docType || 'passport'; // 'passport' or 'form'

        const fileData = fs.readFileSync(req.file.path);
        const mimeType = req.file.mimetype;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We use gemini-1.5-flash for fastest vision plus text capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an advanced AI reading a ${docType === 'passport' ? 'Passport' : 'handwritten Self-Declaration form (usually from German guests, so spelling might refer to German addresses but we only care about standard fields)'}.
            Extract the following fields into strictly formatted JSON. If a field cannot be found, set it to an empty string "". Do not include Markdown blocks like \`\`\`json. Just output the raw JSON.
            Required fields:
            - fullName (String)
            - dateOfBirth (YYYY-MM-DD or empty String)
            - nationality (String)
            - passportNumber (String)
            - visaExpiryDate (YYYY-MM-DD or empty String)
            - email (String)
            - contactNumber (String)
            - remark (String - Any useful notes like allergies, special requests, address if provided)
        `;

        const imagePart = {
            inlineData: {
                data: Buffer.from(fileData).toString("base64"),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();

        let extractedData = {};
        try {
            // Strip any accidental markdown formatting if the model included it
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            extractedData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Gemini output", responseText);
            return res.status(500).json({ message: "Failed to accurately parse AI response." });
        }

        // Delete the temporarily uploaded file used for extraction to save space
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            extractedData
        });

    } catch (err) {
        console.error("Extraction error:", err);
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
