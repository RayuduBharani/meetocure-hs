import mongoose from 'mongoose';
const MONGO_URI = 'mongodb+srv://Meetocure:u3OMLp8PimzhzbqP@meetocure.fp2kavy.mongodb.net/?retryWrites=true&w=majority&appName=MeetOcure';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

import appointmentsRoutes from './routes/appointments.js';
import doctorsRoutes from './routes/doctors.js';
import patientsRoutes from './routes/patients.js';
import patientDetailsRoutes from './routes/patientDetails.js';
import reportsRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import hospitalsRoutes from './routes/hospitals.js';
import authRoutes from './routes/auth.js';

app.use('/api/appointments', appointmentsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/patient-details', patientDetailsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hospitals', hospitalsRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
