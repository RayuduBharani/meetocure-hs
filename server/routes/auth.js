import HospitalLogins from '../models/User.js';
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import upload from '../middlewares/upload.js';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'meetocure_secret';

// POST /auth/register (register hospital)
router.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { hospitalName, address, contact, email, password } = req.body;
        
        // Validate required fields
        if (!hospitalName || !address || !contact || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ success: false, error: 'Email already registered with another hospital.' });
        }

        // Check if hospital name exists
        const hospitalExists = await User.findOne({ hospitalName });
        if (hospitalExists) {
            return res.status(409).json({ success: false, error: 'Hospital name already registered.' });
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

        const savedUser = await newUser.save();
        const token = jwt.sign({ 
            userId: savedUser._id, 
            email, 
            hospitalName 
        }, JWT_SECRET, { expiresIn: '2h' });
        
        res.status(201).json({ 
            success: true, 
            token, 
            hospitalName: savedUser.hospitalName,
            email: savedUser.email,
            id: savedUser._id
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// POST /auth/login (verify credentials and return JWT)
router.post('/login', async (req, res) => {
    try {
        const { email, password, hospitalName } = req.body;
        
        if (!email || !password || !hospitalName) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email, password and hospital name are required' 
            });
        }

        // Find user by email and hospital name
        const user = await User.findOne({ email, hospitalName });
        
        if (!user) {
            // Check if email exists for another hospital
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(409).json({ 
                    success: false, 
                    error: 'This email is registered with a different hospital.' 
                });
            }
            return res.status(404).json({ 
                success: false, 
                error: 'Hospital not found. Please check your credentials or register.' 
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid password' 
            });
        }

        // Generate token
        const token = jwt.sign({ 
            userId: user._id,
            email: user.email, 
            hospitalName: user.hospitalName 
        }, JWT_SECRET, { expiresIn: '2h' });

        return res.json({ 
            success: true, 
            token, 
            hospitalName: user.hospitalName,
            email: user.email,
            id: user._id 
        });
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