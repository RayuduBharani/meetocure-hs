import express from 'express';
import mongoose from 'mongoose';
import DoctorVerification from '../models/doctorVerification.js';

const router = express.Router();

// GET doctors with verified filter and hospitalInfo.hospitalName match
router.get('/', async (req, res) => {
    try {
        const { hospitalName, verified } = req.query;
        const query = {};
        if (typeof verified !== 'undefined') {
            query.verified = String(verified).toLowerCase() === 'true';
        }
        if (hospitalName) {
            query['hospitalInfo.hospitalName'] = { $regex: `^${hospitalName}$`, $options: 'i' };
        }
        const doctors = await DoctorVerification.find(query);
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// GET doctor by ID
router.get('/:doctorId', async (req, res) => {
    try {
        const doctor = await DoctorVerification.findById(req.params.doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
});


// PATCH verify doctor
router.patch('/:doctorId/verify', async (req, res) => {
    try {
        const doctorVerification = await DoctorVerification.findById(req.params.doctorId);
        if (!doctorVerification) {
            return res.status(404).json({ error: 'DoctorVerification not found' });
        }
        doctorVerification.verified = true;
        await doctorVerification.save();
        res.json({ success: true, doctorVerification });
    } catch (err) {
        res.status(500).json({ error: 'Failed to verify doctor', details: err.message });
    }
});

// PATCH reject doctor
router.patch('/:doctorId/reject', async (req, res) => {
    try {
        // Find the doctorVerification document
        const doctorVerification = await DoctorVerification.findById(req.params.doctorId);
        if (!doctorVerification) {
            return res.status(404).json({ error: 'DoctorVerification not found' });
        }
        // Set verified to null in doctorVerification
        doctorVerification.verified = null;
        await doctorVerification.save();

        // Update registrationStatus in doctors collection
        const Doctor = mongoose.connection.collection('doctors');
        await Doctor.updateOne(
            { doctorVerificationId: req.params.doctorId, registrationStatus: { $regex: 'under review by hospital', $options: 'i' } },
            { $set: { registrationStatus: 'rejected' } }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject doctor', details: err.message });
    }
});

export default router;
