const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Patient associated with this appointment
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Staff/user who created the appointment
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Appointment details
    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentType: {
      type: String,
      trim: true,
      default: "consultation",
    },

    doctorName: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    // Appointment status
    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);