const mongoose = require("mongoose");

const preparationStepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

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
      enum: ["not_started", "pending", "in_progress", "completed"],
      default: "not_started",
    },

    preparationSteps: {
      type: [preparationStepSchema],
      default: [],
    },

    preparationChecklistInitialized: {
      type: Boolean,
      default: false,
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