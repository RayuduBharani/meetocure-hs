import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

 
    patientInfo: {
      name: { type: String, required: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      age: { type: Number, required: true, min: 0, max: 150 },
      phone: { type: String, required: true, match: /^\+?[1-9]\d{1,14}$/ },
      blood_group: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        default: null,
      },
      allergies: { type: [String], default: [] },
      medical_history_summary: { type: String, default: "" },
      note: { type: String, default: "" },
    },

    // Medical Records
    medicalRecords: [
      {
        record_type: {
          type: String,
          enum: ["prescription", "ct_scan", "xray", "other"],
          required: true,
        },
        file_url: { type: String, required: true },
        description: { type: String, default: "" },
        upload_date: { type: Date, default: Date.now },
      },
    ],

    // Appointment core
    appointment_date: {
      type: Date,
      required: true, // Stores the day (e.g., 2025-09-07)
    },
    appointment_time: {
      type: String,
      required: true, // 24h format, e.g., "09:30"
    },
    appointment_type: {
      type: String,
      default: "virtual",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    reason: { type: String, default: "" },

    // Payment Integration
    payment: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "USD" },
      payment_method: {
        type: String,
        enum: ["credit_card", "paypal", "stripe", "other"],
        default: null,
      },
      transaction_id: { type: String, default: null },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paid_at: { type: Date, default: null },
    },
     expireAt: {
      type: Date,
      index: { expires: 0 }, 
    },
  },
  { timestamps: true }
);

// ✅ Prevent double-booking for the same doctor, date & time
appointmentSchema.index(
  { doctor: 1, appointment_date: 1, appointment_time: 1 },
  { unique: true }
);

appointmentSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("appointment_date") || this.isModified("appointment_time")) {
    const [hours, minutes] = this.appointment_time.split(":").map(Number);

    const appointmentDateTime = new Date(this.appointment_date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    if (appointmentDateTime < new Date()) {
      return next(new Error("Appointment date/time cannot be in the past"));
    }

    this.expireAt = new Date(appointmentDateTime.getTime() + 30 * 60000);
  }
  next();
});

export default mongoose.model("Appointments", appointmentSchema);
