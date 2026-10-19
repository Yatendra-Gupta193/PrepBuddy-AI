const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
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

=======
      ref: "Patient",
      required: true,
    },
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
<<<<<<< HEAD
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reminder", reminderSchema);
=======
    type: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    channel: {
      type: String,
      enum: ["Email", "Notification"],
      default: "Notification",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Sent", "Pending"],
      default: "Scheduled",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
