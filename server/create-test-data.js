// Script to create test data for appointments
import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import DoctorVerification from './models/DoctorVerification.js';

const MONGO_URI = 'mongodb+srv://Meetocure:u3OMLp8PimzhzbqP@meetocure.fp2kavy.mongodb.net/?retryWrites=true&w=majority&appName=MeetOcure';

const createTestData = async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Create a test patient
        const patient = new Patient({
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            dateOfBirth: new Date('1990-01-15'),
            gender: 'male',
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA'
            },
            emergencyContact: {
                name: 'Jane Doe',
                relationship: 'Spouse',
                phone: '+1234567891'
            },
            medicalInfo: {
                bloodType: 'O+',
                allergies: ['Peanuts', 'Shellfish'],
                medicalHistory: 'No significant medical history'
            }
        });

        await patient.save();
        console.log('Created patient:', patient._id);

        // Create a doctor verification
        const doctorVerification = new DoctorVerification({
            licenseNumber: 'DOC123456',
            specialization: 'Cardiology',
            hospital: 'General Hospital',
            status: 'verified'
        });

        await doctorVerification.save();
        console.log('Created doctor verification:', doctorVerification._id);

        // Create a test doctor
        const doctor = new Doctor({
            name: 'Dr. Smith',
            email: 'dr.smith@hospital.com',
            phone: '+1234567892',
            verificationDetails: doctorVerification._id
        });

        await doctor.save();
        console.log('Created doctor:', doctor._id);

        // Create a test appointment
        const appointment = new Appointment({
            patient: patient._id,
            doctor: doctor._id,
            patientInfo: {
                name: 'John Doe',
                gender: 'male',
                age: 34,
                phone: '+1234567890',
                blood_group: 'O+',
                allergies: ['Peanuts', 'Shellfish'],
                medical_history_summary: 'No significant medical history',
                note: 'Regular checkup appointment'
            },
            appointment_date: new Date('2024-12-20'),
            appointment_time: '10:30',
            appointment_type: 'in-person',
            status: 'confirmed',
            reason: 'Regular checkup',
            payment: {
                amount: 150,
                currency: 'USD',
                payment_method: 'credit_card',
                status: 'paid',
                paid_at: new Date()
            }
        });

        await appointment.save();
        console.log('Created appointment:', appointment._id);

        console.log('\nTest data created successfully!');
        console.log('Appointment ID:', appointment._id);
        console.log('Patient ID:', patient._id);
        console.log('Doctor ID:', doctor._id);

    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createTestData();
