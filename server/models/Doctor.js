import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    registrationStatus:{
      type: String,
      enum: [
        "under review by hospital",     
        "verified",         
        "rejected"
      ],
      default: "under review by hospital",
    },
    verificationDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorVerification",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
