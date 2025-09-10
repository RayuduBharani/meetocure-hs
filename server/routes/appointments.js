import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// GET all appointments for a specific doctor (using verification ID)
router.get('/doctor/:verificationId', async (req, res) => {
    try {
        const { verificationId } = req.params;
        const { status, limit = 50, page = 1 } = req.query;
        
        // Validate verificationId
        if (!verificationId || !mongoose.Types.ObjectId.isValid(verificationId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid verification ID format' 
            });
        }

        // First, find the actual doctor record using the verification ID
        const doctor = await Doctor.findOne({ verificationDetails: verificationId });
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                error: 'Doctor not found for this verification ID' 
            });
        }

        // Build query using the actual doctor ID
        const query = { doctor: doctor._id };
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Find appointments with populated patient info
        const appointments = await Appointment.find(query)
            .populate('patient', 'name email phone')
            .sort({ appointment_date: -1, appointment_time: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Appointment.countDocuments(query);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching doctor appointments:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch doctor appointments', 
            details: err.message 
        });
    }
});

// GET appointment statistics for a specific doctor (using verification ID)
router.get('/doctor/:verificationId/stats', async (req, res) => {
    try {
        const { verificationId } = req.params;
        
        // Validate verificationId
        if (!verificationId || !mongoose.Types.ObjectId.isValid(verificationId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid verification ID format' 
            });
        }

        // First, find the actual doctor record using the verification ID
        const doctor = await Doctor.findOne({ verificationDetails: verificationId });
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                error: 'Doctor not found for this verification ID' 
            });
        }

        // Get appointment counts by status using the actual doctor ID
        const stats = await Appointment.aggregate([
            { $match: { doctor: new mongoose.Types.ObjectId(doctor._id) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get total appointments and unique patients using the actual doctor ID
        const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
        const uniquePatients = await Appointment.distinct('patient', { doctor: doctor._id });

        // Format stats
        const formattedStats = {
            totalAppointments,
            totalPatients: uniquePatients.length,
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
        console.error('Error fetching doctor appointment stats:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch doctor appointment stats', 
            details: err.message 
        });
    }
});

// GET patients who have appointments with a specific doctor (using verification ID)
router.get('/doctor/:verificationId/patients', async (req, res) => {
    try {
        const { verificationId } = req.params;
        
        // Validate verificationId
        if (!verificationId || !mongoose.Types.ObjectId.isValid(verificationId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid verification ID format' 
            });
        }

        // First, find the actual doctor record using the verification ID
        const doctor = await Doctor.findOne({ verificationDetails: verificationId });
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                error: 'Doctor not found for this verification ID' 
            });
        }

        // Get unique patients who have appointments with this doctor using the actual doctor ID
        const patients = await Appointment.aggregate([
            { $match: { doctor: new mongoose.Types.ObjectId(doctor._id) } },
            {
                $group: {
                    _id: '$patient',
                    appointmentCount: { $sum: 1 },
                    lastAppointment: { $max: '$appointment_date' }
                }
            },
            {
                $lookup: {
                    from: 'patients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'patientInfo'
                }
            },
            {
                $unwind: '$patientInfo'
            },
            {
                $project: {
                    _id: '$patientInfo._id',
                    name: '$patientInfo.name',
                    email: '$patientInfo.email',
                    phone: '$patientInfo.phone',
                    appointmentCount: 1,
                    lastAppointment: 1
                }
            },
            { $sort: { lastAppointment: -1 } }
        ]);

        res.json(patients);
    } catch (err) {
        console.error('Error fetching doctor patients:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch doctor patients', 
            details: err.message 
        });
    }
});

// GET all appointments (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { doctorId, patientId, status, date, limit = 50, page = 1 } = req.query;
        
        // Build query
        const query = {};
        if (doctorId) query.doctor = doctorId;
        if (patientId) query.patient = patientId;
        if (status) query.status = status;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.appointment_date = { $gte: startDate, $lt: endDate };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Find appointments with populated data
        const appointments = await Appointment.find(query)
            .populate('doctor', 'name email')
            .populate('patient', 'name email phone')
            .sort({ appointment_date: -1, appointment_time: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCount = await Appointment.countDocuments(query);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch appointments', 
            details: err.message 
        });
    }
});

// GET today's appointments
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            appointment_date: { $gte: today, $lt: tomorrow }
        })
        .populate('patient', 'name email phone')
        .populate({
            path: 'doctor',
            populate: {
                path: 'verificationDetails',
                model: 'doctorVerification'
            }
        })
        .sort({ appointment_time: 1 });

        res.json(appointments);
    } catch (err) {
        console.error('Error fetching today\'s appointments:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch today\'s appointments', 
            details: err.message 
        });
    }
});

// GET weekly appointments
router.get('/weekly', async (req, res) => {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointment_date: { $gte: monday, $lte: sunday }
        })
        .populate('patient', 'name email phone')
        .populate({
            path: 'doctor',
            populate: {
                path: 'verificationDetails',
                model: 'doctorVerification'
            }
        })
        .sort({ appointment_date: 1, appointment_time: 1 });

        res.json(appointments);
    } catch (err) {
        console.error('Error fetching weekly appointments:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch weekly appointments', 
            details: err.message 
        });
    }
});

// GET appointment by ID with complete details
router.get('/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        // Validate appointmentId
        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid appointment ID format' 
            });
        }

        // Find appointment with populated patient and doctor details
        const appointment = await Appointment.findById(appointmentId)
            .populate('patient', 'name email phone dateOfBirth gender address emergencyContact medicalInfo')
            .populate({
                path: 'doctor',
                populate: {
                    path: 'verificationDetails',
                        model: 'doctorVerification'
                }
            });

        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                error: 'Appointment not found' 
            });
        }


        res.json({
            success: true,
            data: appointment
        });
    } catch (err) {
        console.error('Error fetching appointment:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch appointment', 
            details: err.message 
        });
    }
});

export default router;
