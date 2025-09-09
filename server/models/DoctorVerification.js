import mongoose from 'mongoose';

const DoctorVerificationSchema = new mongoose.Schema({
    name: { type: String },
    specialization: { type: String },
    verified: { type: Boolean, default: false },
    // Add other fields as needed
});

export default mongoose.model('doctorVerification', DoctorVerificationSchema);
