import express from 'express';
const router = express.Router();

// Dummy endpoint for patients
import mongoose from 'mongoose';
// Get patients who booked appointments to verified doctors for a hospital
router.get('/', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        if (!hospitalName) {
            return res.status(400).json({ error: 'hospitalName is required' });
        }
        // Get verified doctors for the hospital
        const DoctorVerification = mongoose.connection.collection('doctorverifications');
        const verifiedDoctors = await DoctorVerification.find({ verified: true, 'hospitalInfo.hospitalName': { $regex: `^${hospitalName}$`, $options: 'i' } }).toArray();
        const doctorIds = verifiedDoctors.map(doc => doc._id.toString());

        // Get appointments for these doctors
        const Appointments = mongoose.connection.collection('appointments');
        const appointments = await Appointments.find({ doctorId: { $in: doctorIds } }).toArray();
        const patientIds = [...new Set(appointments.map(app => app.patientId))];

        // Get patients
        const Patients = mongoose.connection.collection('patients');
        const patients = await Patients.find({ _id: { $in: patientIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();

        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch patients', details: err.message });
    }
});

export default router;
