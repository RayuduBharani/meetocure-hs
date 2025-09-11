import express, { json } from 'express';
import mongoose from 'mongoose';
import DoctorVerification from '../models/DoctorVerification.js';
import Doctor from '../models/Doctor.js';
import User from "../models/User.js"
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Get patients who booked appointments to verified doctors for a hospital
router.get('/:hospitalId', async (req, res) => {
    try {
        const { hospitalId } = req.params;
        
        if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Valid Hospital ID is required' 
            });
        }

        const hospitalData = await User.findById(hospitalId);
        if (!hospitalData) {
            return res.status(404).json({
                success: false,
                error: 'Hospital not found'
            });
        }
        // console.log(hospitalData)

        // Get all doctors from DoctorVerification collection based on hospital's doctors array
        // Get all verified doctor verifications for this hospital
        // Clean and validate doctor IDs
        const validDoctorIds = hospitalData.docters
            .map(id => id.toString().trim())
            .filter(id => mongoose.Types.ObjectId.isValid(id));

        const verifiedDoctorVerifications = await DoctorVerification.find({ 
            _id: { $in: validDoctorIds },
            registrationStatus: "verified"
        });

        // Get all doctors that reference these verifications
        const doctors = await Doctor.find({
            verificationDetails: { $in: verifiedDoctorVerifications.map(v => v._id) },
            registrationStatus: "verified"
        });

        // Find all appointments for these doctors and populate detailed information
        const appointments = await Appointment.find({ 
            doctor: { $in: doctors.map(d => d._id) }
        })
        .populate({
            path: 'patient',
            select: '-notifications' // Exclude notifications array to reduce payload size
        })
        .populate({
            path: 'doctor',
            populate: {
                path: 'verificationDetails',
                model: 'doctorVerification'
            }
        });

        // Create a map to store unique patients with their appointments
        const patientMap = new Map();

        appointments.forEach(appointment => {
            const patient = appointment.patient;
            if (!patient) return;
            // console.log('Processing appointment for patient:', appointment);

            if (!patientMap.has(patient._id.toString())) {
                // Initialize patient data with all fields from the schema
                patientMap.set(patient._id.toString(), {
                    id: patient._id,
                    name: patient.name,
                    email: patient.email,
                    phone: patient.phone,
                    dateOfBirth: patient.dateOfBirth,
                    gender: patient.gender,
                    address: patient.address,
                    emergencyContact: patient.emergencyContact,
                    medicalInfo: patient.medicalInfo,
                    status: patient.status,
                    createdAt: patient.createdAt,
                    appointments: []
                });
            }

            // Add appointment details
            const patientData = patientMap.get(patient._id.toString());
            patientData.appointments.push({
                id: appointment._id,
                date: appointment.appointment_date,
                time: appointment.appointment_time,
                type: appointment.appointment_type,
                status: appointment.status,
                reason: appointment.reason,
                doctor: {
                    id: appointment.doctor._id,
                    email: appointment.doctor.email,
                    mobileNumber: appointment.doctor.mobileNumber,
                    registrationStatus: appointment.doctor.registrationStatus,
                    // Information from verification details
                    name: appointment.doctor.verificationDetails?.fullName || appointment.doctor.verificationDetails?.doctorName || 'N/A',
                    specialization: appointment.doctor.verificationDetails?.specialization || 'N/A',
                    specialty: appointment.doctor.verificationDetails?.specialty || 'N/A',
                    profileImage: appointment.doctor.verificationDetails?.profileImage,
                    verified: appointment.doctor.verificationDetails?.verified,
                    hospitalInfo: appointment.doctor.verificationDetails?.hospitalInfo
                },
                patientInfo: appointment.patientInfo,
                payment: {
                    amount: appointment.payment?.amount,
                    status: appointment.payment?.status,
                    currency: appointment.payment?.currency
                },
                medicalRecords: appointment.medicalRecords
            });
        });

        // Convert map to array and sort patients by most recent appointment
        const patients = Array.from(patientMap.values()).map(patient => ({
            ...patient,
            appointments: patient.appointments.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            )
        }));

        res.json({
            success: true,
            patients
        });
    }
    catch(err) {
        console.error('Error fetching patients:', err);
        let errorMessage = 'Internal server error';
        let statusCode = 500;

        if (err.name === 'CastError') {
            errorMessage = 'Invalid ID format';
            statusCode = 400;
        } else if (err.name === 'ValidationError') {
            errorMessage = err.message;
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

export default router;
