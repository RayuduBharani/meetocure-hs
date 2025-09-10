import express from 'express';
import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// GET patient by ID with full details
router.get('/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Validate patientId
        if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid patient ID format' 
            });
        }

        // Find patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                error: 'Patient not found' 
            });
        }

        res.json(patient);
    } catch (err) {
        console.error('Error fetching patient:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch patient', 
            details: err.message 
        });
    }
});

// GET all patients with optional filters
router.get('/', async (req, res) => {
    try {
        const { name, email, phone, status, limit = 50, page = 1 } = req.query;
        
        // Build query
        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        if (phone) query.phone = { $regex: phone, $options: 'i' };
        if (status) query.status = status;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Find patients
        const patients = await Patient.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Patient.countDocuments(query);

        res.json({
            success: true,
            data: patients,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch patients', 
            details: err.message 
        });
    }
});

// POST create new patient
router.post('/', async (req, res) => {
    try {
        const patientData = req.body;
        
        // Create new patient
        const patient = new Patient(patientData);
        await patient.save();

        res.status(201).json({
            success: true,
            data: patient,
            message: 'Patient created successfully'
        });
    } catch (err) {
        console.error('Error creating patient:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create patient', 
            details: err.message 
        });
    }
});

// PUT update patient
router.put('/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const updateData = req.body;
        
        // Validate patientId
        if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid patient ID format' 
            });
        }

        // Update patient
        const patient = await Patient.findByIdAndUpdate(
            patientId, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                error: 'Patient not found' 
            });
        }

        res.json({
            success: true,
            data: patient,
            message: 'Patient updated successfully'
        });
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update patient', 
            details: err.message 
        });
    }
});

// DELETE patient
router.delete('/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Validate patientId
        if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid patient ID format' 
            });
        }

        // Check if patient has appointments
        const appointmentCount = await Appointment.countDocuments({ patient: patientId });
        if (appointmentCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete patient with existing appointments' 
            });
        }

        // Delete patient
        const patient = await Patient.findByIdAndDelete(patientId);
        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                error: 'Patient not found' 
            });
        }

        res.json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting patient:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete patient', 
            details: err.message 
        });
    }
});

// GET patient statistics
router.get('/:patientId/stats', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Validate patientId
        if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid patient ID format' 
            });
        }

        // Get appointment counts by status
        const stats = await Appointment.aggregate([
            { $match: { patient: new mongoose.Types.ObjectId(patientId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get total appointments
        const totalAppointments = await Appointment.countDocuments({ patient: patientId });

        // Format stats
        const formattedStats = {
            totalAppointments,
            byStatus: {
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0
            }
        };

        // Populate status counts
        stats.forEach(stat => {
            formattedStats.byStatus[stat._id] = stat.count;
        });

        res.json(formattedStats);
    } catch (err) {
        console.error('Error fetching patient stats:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch patient stats', 
            details: err.message 
        });
    }
});

export default router;
