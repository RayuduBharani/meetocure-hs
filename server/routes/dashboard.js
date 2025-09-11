import express from 'express';
import DoctorVerification from '../models/DoctorVerification.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
const router = express.Router();

// GET all patients who booked appointments with verified doctors in the current hospital
import PatientDetails from '../models/PatientDetails.js';

router.get('/verified-doctors-patients', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        if (!hospitalName) {
            return res.status(400).json({ success: false, error: 'hospitalName query parameter is required' });
        }

        // Find verified doctor verifications for the hospital
        const doctorVerifications = await DoctorVerification.find({
            verified: true,
            'hospitalInfo.hospitalName': { $regex: `^${hospitalName}$`, $options: 'i' }
        });

        // Get corresponding verified doctors
        const doctorIds = await Promise.all(
            doctorVerifications.map(async (verification) => {
                const doctor = await Doctor.findOne({ verificationDetails: verification._id, registrationStatus: 'verified' });
                return doctor ? doctor._id : null;
            })
        );
        const filteredDoctorIds = doctorIds.filter(id => id !== null);

        // Find all unique patients who booked appointments with these doctors
        const patientIds = await Appointment.distinct('patient', { doctor: { $in: filteredDoctorIds } });
        const patients = await Promise.all(
            patientIds.map(async (patientId) => {
                const details = await PatientDetails.findOne({ patient: patientId });
                return details;
            })
        );

        res.json({ success: true, patients: patients.filter(Boolean) });
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch patients', details: err.message });
    }
});



// GET today's appointments for verified doctors in the current hospital
router.get('/verified-doctors-todays-appointments', async (req, res) => {
    try {
        const { hospitalName, date } = req.query;
        if (!hospitalName || !date) {
            return res.status(400).json({ success: false, error: 'hospitalName and date query parameters are required' });
        }

        // Find verified doctor verifications for the hospital
        const doctorVerifications = await DoctorVerification.find({
            verified: true,
            'hospitalInfo.hospitalName': { $regex: `^${hospitalName}$`, $options: 'i' }
        });

        // Get corresponding verified doctors
        const doctorIds = await Promise.all(
            doctorVerifications.map(async (verification) => {
                const doctor = await Doctor.findOne({ verificationDetails: verification._id, registrationStatus: 'verified' });
                return doctor ? doctor._id : null;
            })
        );
        const filteredDoctorIds = doctorIds.filter(id => id !== null);

        // Find today's appointments for these doctors
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctor: { $in: filteredDoctorIds },
            appointment_date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('doctor').populate('patient');

        res.json({ success: true, appointments });
    } catch (err) {
        console.error('Error fetching today appointments:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch today appointments', details: err.message });
    }
});

// GET all appointments for verified doctors in the current hospital
router.get('/verified-doctors-all-appointments', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        if (!hospitalName) {
            return res.status(400).json({ success: false, error: 'hospitalName query parameter is required' });
        }

        // Find verified doctor verifications for the hospital
        const doctorVerifications = await DoctorVerification.find({
            verified: true,
            'hospitalInfo.hospitalName': { $regex: `^${hospitalName}$`, $options: 'i' }
        });

        // Get corresponding verified doctors
        const doctorIds = await Promise.all(
            doctorVerifications.map(async (verification) => {
                const doctor = await Doctor.findOne({ verificationDetails: verification._id, registrationStatus: 'verified' });
                return doctor ? doctor._id : null;
            })
        );
        const filteredDoctorIds = doctorIds.filter(id => id !== null);

        // Find all appointments for these doctors
        const appointments = await Appointment.find({
            doctor: { $in: filteredDoctorIds }
        })
            .populate({
                path: 'doctor',
                populate: { path: 'verificationDetails', model: 'doctorVerification' }
            })
            .populate('patient');

        res.json({ success: true, appointments });
    } catch (err) {
        console.error('Error fetching all appointments:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch all appointments', details: err.message });
    }
});


// Dummy endpoint for dashboard activity
router.get('/activity', (req, res) => {
    res.json([]); // Return empty array for now
});

// GET total appointments for verified doctors in the current hospital
router.get('/verified-doctors-appointments-count', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        if (!hospitalName) {
            return res.status(400).json({ success: false, error: 'hospitalName query parameter is required' });
        }

        // Find verified doctor verifications for the hospital
        const doctorVerifications = await DoctorVerification.find({
            verified: true,
            'hospitalInfo.hospitalName': { $regex: `^${hospitalName}$`, $options: 'i' }
        });

        // Get corresponding verified doctors
        const doctorIds = await Promise.all(
            doctorVerifications.map(async (verification) => {
                const doctor = await Doctor.findOne({ verificationDetails: verification._id, registrationStatus: 'verified' });
                return doctor ? doctor._id : null;
            })
        );
        const filteredDoctorIds = doctorIds.filter(id => id !== null);

        // Count appointments for these doctors by status
        const totalAppointments = await Appointment.countDocuments({ doctor: { $in: filteredDoctorIds } });
        const confirmedAppointments = await Appointment.countDocuments({ doctor: { $in: filteredDoctorIds }, status: { $in: ['confirmed', 'Confirmed'] } });
        const pendingAppointments = await Appointment.countDocuments({ doctor: { $in: filteredDoctorIds }, status: { $in: ['pending', 'Pending'] } });
        const cancelledAppointments = await Appointment.countDocuments({ doctor: { $in: filteredDoctorIds }, status: { $in: ['cancelled', 'Cancelled'] } });

        res.json({
            success: true,
            totalAppointments,
            confirmedAppointments,
            pendingAppointments,
            cancelledAppointments
        });
    } catch (err) {
        console.error('Error fetching verified doctors appointments count:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch count', details: err.message });
    }
});

export default router;
