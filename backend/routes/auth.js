const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role,
            hotelBranch: req.body.hotelBranch
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json("User not found!");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password!");

        const token = jwt.sign(
            { id: user._id, role: user.role, hotelBranch: user.hotelBranch },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        const { password, ...info } = user._doc;
        res.status(200).json({ ...info, token, success: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
