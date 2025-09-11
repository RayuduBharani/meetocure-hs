
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'meetocure_secret';

// Multer setup for hospital image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads/hospitals'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage });

// POST /auth/register (register hospital)
router.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { hospitalName, address, contact, email, password } = req.body;
        if (!hospitalName || !address || !contact || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }
        // Check if hospital/email already exists
        const exists = await User.findOne({ email, hospitalName });
        if (exists) {
            return res.status(409).json({ success: false, error: 'Hospital already registered with this email.' });
        }
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/hospitals/${req.file.filename}`;
        }
        const newUser = new User({
            hospitalName,
            address,
            contact,
            email,
            password,
            hospitalImage: imageUrl
        });
        await newUser.save();
        const token = jwt.sign({ email, hospitalName }, JWT_SECRET, { expiresIn: '2h' });
        res.status(201).json({ success: true, token, hospitalName });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /auth/login (verify credentials and return JWT)
router.post('/login', async (req, res) => {
    try {
        const { email, password, hospitalName } = req.body;
        const user = await User.findOne({ email, hospitalName });
        if (user) {
            // User exists for this hospital, verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid password' });
            const token = jwt.sign({ email, hospitalName: user.hospitalName }, JWT_SECRET, { expiresIn: '2h' });
            return res.json({ success: true, token, hospitalName: user.hospitalName , email : user.email , id : user._id });
        }
        // Check if email exists for another hospital
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ success: false, error: 'This email is already registered for another hospital.' });
        }
        // Hospital/email not found, return 404 so frontend can show register page
        return res.status(404).json({ success: false, error: 'Hospital or email not found. Please register.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /auth/me (get user info from JWT)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ email: decoded.email, hospitalName: decoded.hospitalName });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;