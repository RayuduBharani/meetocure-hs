import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true }, 
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "" }
    },
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" }
    },
    medicalInfo: {
      bloodType: { 
        type: String, 
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], 
        default: null 
      },
      allergies: [{ type: String }],
      medicalHistory: { type: String, default: "" }
    },
    notifications: { type: [notificationSchema], default: [] },
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
