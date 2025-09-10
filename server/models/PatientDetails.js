import mongoose from "mongoose";

const patientDetailsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    name: { type: String, trim: true, default: "" },
    phone: { type: String, required: true }, // mirror of Patient.phone (validated in controller)
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    photo: { type: String, default: "" }, // base64 or URL
  },
  { timestamps: true }
);

export default mongoose.model("PatientDetails", patientDetailsSchema);