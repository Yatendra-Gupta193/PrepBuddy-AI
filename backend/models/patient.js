const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    // Medical Information
    diagnosis: {
      type: String,
      trim: true,
    },

    procedure: {
      type: String,
      trim: true,
    },

    procedureDate: {
      type: Date,
    },

    medicalHistory: {
      type: String,
      trim: true,
    },

    allergies: {
      type: String,
      trim: true,
    },

    medications: {
      type: String,
      trim: true,
    },

    // Preparation status
    preparationStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    // Patient created by logged-in staff/user
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);