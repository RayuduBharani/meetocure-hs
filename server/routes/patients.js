import express from 'express';
import mongoose from 'mongoose';
import DoctorVerification from '../models/DoctorVerification.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// Get patients who booked appointments to verified doctors for a hospital
router.get('/', async (req, res) => {
    try {
        const { hospitalName } = req.query;
        
        if (!hospitalName) {
            return res.status(400).json({ 
                success: false, 
                error: 'hospitalName is required' 
            });
        }

        // Get verified doctors for the hospital using our new structure
        const verifiedDoctorVerifications = await DoctorVerification.find({ 
            verified: true, 
            'hospitalInfo.hospitalName': { $regex: `^${hospitalName}$`, $options: 'i' } 
        });

        // Get corresponding doctor records
        const verifiedDoctors = await Promise.all(
            verifiedDoctorVerifications.map(async (verification) => {
                const doctor = await Doctor.findOne({ verificationDetails: verification._id });
                return {
                    doctorVerification: verification,
                    doctor: doctor
                };
            })
        );

        // Filter to only include doctors that are verified in both collections
        const fullyVerifiedDoctors = verifiedDoctors.filter(item => 
            item.doctor && item.doctor.registrationStatus === "verified"
        );

        const doctorIds = fullyVerifiedDoctors.map(item => item.doctorVerification._id.toString());

        if (doctorIds.length === 0) {
            return res.json([]);
        }

        // Get appointments for these doctors
        const Appointments = mongoose.connection.collection('appointments');
        const appointments = await Appointments.find({ 
            doctorId: { $in: doctorIds } 
        }).toArray();

        const patientIds = [...new Set(appointments.map(app => app.patientId))];

        if (patientIds.length === 0) {
            return res.json([]);
        }

        // Get patients with their appointment history
        const Patients = mongoose.connection.collection('patients');
        const patients = await Patients.find({ 
            _id: { $in: patientIds.map(id => new mongoose.Types.ObjectId(id)) } 
        }).toArray();

        // Enrich patients with their appointment history
        const patientsWithAppointments = patients.map(patient => {
            const patientAppointments = appointments
                .filter(app => app.patientId === patient._id.toString())
                .map(appointment => {
                    // Find the doctor for this appointment
                    const doctorData = fullyVerifiedDoctors.find(
                        doc => doc.doctorVerification._id.toString() === appointment.doctorId
                    );
                    
                    return {
                        id: appointment._id.toString(),
                        date: appointment.date,
                        time: appointment.time,
                        status: appointment.status,
                        details: appointment.details || appointment.notes,
                        doctor: {
                            name: doctorData?.doctorVerification.name || 
                                  doctorData?.doctorVerification.doctorName || 
                                  doctorData?.doctorVerification.fullName || 
                                  'Unknown Doctor',
                            specialty: doctorData?.doctorVerification.specialty || 
                                      doctorData?.doctorVerification.specialization || 
                                      'General Practice'
                        }
                    };
                });

            return {
                id: patient._id.toString(),
                patientId: patient.patientId || patient._id.toString(),
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                gender: patient.gender,
                dateOfBirth: patient.dateOfBirth,
                appointments: patientAppointments
            };
        });

        res.json(patientsWithAppointments);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch patients', 
            details: err.message 
        });
    }
});

export default router;
