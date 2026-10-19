<<<<<<< HEAD
const Reminder = require("../models/reminder");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");

const createReminder = async (req, res) => {
  try {
    const {
      patient, appointment,
      title, message,
      scheduledAt, channel,
    } = req.body;

    // Required fields validation
    if(!patient || !title || !message || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Patient, title, message and scheduledAt are required",
      });
    }

    const existingPatient = await Patient.findOne({
      _id: patient,
      createdBy: req.user.userId,
    });

    if (!existingPatient) {
=======
const Patient = require("../models/patient");
const Reminder = require("../models/reminder");

const REMINDER_UPDATE_FIELDS = [
  "patient",
  "type",
  "message",
  "scheduledAt",
  "channel",
  "status",
  "priority",
];

const pickFields = (source, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => Object.hasOwn(source, field))
      .map((field) => [field, source[field]])
  );

const populatePatient = (query) =>
  query.populate("patient", "name procedure phone email");

const createReminder = async (req, res) => {
  try {
    const { patient, type, scheduledAt } = req.body;
    if (!patient || !type || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Patient, reminder type and scheduled date are required",
      });
    }

    const ownedPatient = await Patient.findOne({
      _id: patient,
      createdBy: req.user.userId,
    });
    if (!ownedPatient) {
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

<<<<<<< HEAD
    // If appointment is provided, verify it
    if (appointment) {
      const existingAppointment = await Appointment.findOne({
        _id: appointment,
        createdBy: req.user.userId,
        patient: patient,
      });

      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found for this patient",
        });
      }
    }

    const reminder = await Reminder.create({
      patient,
      appointment: appointment || undefined,
      title,
      message,
      scheduledAt,
      channel: channel || "in_app",
      createdBy: req.user.userId,
    });

    const populatedReminder = await Reminder.findById(reminder._id)
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder: populatedReminder,
    });
  } catch (error) {
    console.error("Create reminder error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating reminder",
      error: error.message,
=======
    const reminder = await Reminder.create({
      ...pickFields(req.body, REMINDER_UPDATE_FIELDS),
      patient: ownedPatient._id,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder: await populatePatient(Reminder.findById(reminder._id)),
    });
  } catch (error) {
    console.error("Create Reminder Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create reminder",
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    });
  }
};

const getReminders = async (req, res) => {
  try {
<<<<<<< HEAD
    const reminders = await Reminder.find({
      createdBy: req.user.userId,
    })
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email role")
      .sort({ scheduledAt: 1 });

    res.status(200).json({
=======
    const reminders = await populatePatient(
      Reminder.find({ createdBy: req.user.userId }).sort({ scheduledAt: 1 })
    );

    return res.status(200).json({
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("Get reminders error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching reminders",
      error: error.message,
=======
    console.error("Get Reminders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reminders",
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    });
  }
};

<<<<<<< HEAD
// Get Reminder By ID
const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    })
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email role");

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      reminder,
    });
  } catch (error) {
    console.error("Get reminder error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching reminder",
      error: error.message,
    });
  }
};

// Update Reminder
const updateReminder = async (req, res) => {
  try {
    const allowedFields = [
      "title", "message",
      "scheduledAt", "channel",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email role");

=======
const updateReminder = async (req, res) => {
  try {
    const updates = pickFields(req.body, REMINDER_UPDATE_FIELDS);

    if (updates.patient) {
      const patient = await Patient.findOne({
        _id: updates.patient,
        createdBy: req.user.userId,
      });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
    }

    const reminder = await populatePatient(
      Reminder.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user.userId },
        { $set: updates },
        { new: true, runValidators: true }
      )
    );
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

<<<<<<< HEAD
    res.status(200).json({
=======
    return res.status(200).json({
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
      success: true,
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("Update reminder error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating reminder",
      error: error.message,
=======
    console.error("Update Reminder Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update reminder",
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    });
  }
};

<<<<<<< HEAD
// Update Reminder Status
const updateReminderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "sent",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use pending, sent, completed or cancelled",
      });
    }

    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId,
      },
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email role");

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder status updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("Update reminder status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating reminder status",
      error: error.message,
    });
  }
};

// Delete Reminder
=======
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });
<<<<<<< HEAD

=======
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

<<<<<<< HEAD
    res.status(200).json({
=======
    return res.status(200).json({
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
<<<<<<< HEAD
    console.error("Delete reminder error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting reminder",
      error: error.message,
=======
    console.error("Delete Reminder Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete reminder",
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
<<<<<<< HEAD
  getReminderById,
  updateReminder,
  updateReminderStatus,
  deleteReminder,
};
=======
  updateReminder,
  deleteReminder,
};
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
