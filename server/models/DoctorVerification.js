import mongoose from 'mongoose';

const DoctorVerificationSchema = new mongoose.Schema({
    name: { type: String },
    doctorName: { type: String },
    fullName: { type: String },
    email: { type: String },
    specialization: { type: String },
    specialty: { type: String },
    verified: { type: Boolean, default: false },
    registrationStatus: { 
        type: String, 
        enum: ["under review by hospital", "verified", "rejected"],
        default: "under review by hospital" 
    },
    rejectionReason: { type: String }, // Reason for rejection
    hospitalInfo: {
        hospitalName: { type: String }
    },
    profileImage: { type: String },
}, { timestamps: true });

export default mongoose.model('doctorVerification', DoctorVerificationSchema);
