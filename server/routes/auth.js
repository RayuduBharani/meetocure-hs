import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'meetocure_secret';

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
            return res.json({ success: true, token, hospitalName: user.hospitalName });
        }
        // Check if email exists for another hospital
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ success: false, error: 'This email is already registered for another hospital.' });
        }
        // Register new user
        const newUser = new User({ email, password, hospitalName });
        await newUser.save();
        const token = jwt.sign({ email, hospitalName }, JWT_SECRET, { expiresIn: '2h' });
        return res.status(201).json({ success: true, token, hospitalName });
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