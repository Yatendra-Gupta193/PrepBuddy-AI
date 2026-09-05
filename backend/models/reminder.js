const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", required: true, },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment", required: false, },

    title: { type: String, required: true, trim: true, },

    message: { type: String, required: true, trim: true,},

    scheduledAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "sent", "completed", "cancelled"],
      default: "pending",
    },

    channel: {
      type: String,
      enum: ["in_app", "email", "sms", "push"],
      default: "in_app",
    },

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

module.exports = mongoose.model("Reminder", reminderSchema);