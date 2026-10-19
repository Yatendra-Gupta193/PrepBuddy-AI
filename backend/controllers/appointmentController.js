const Appointment = require("../models/appointment");
const Patient = require("../models/patient");
const mongoose = require("mongoose");

const APPOINTMENT_UPDATE_FIELDS = [
  "patient",
  "appointmentDate",
  "appointmentType",
  "doctorName",
  "department",
  "notes",
  "status",
];

const pickFields = (source, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => Object.hasOwn(source, field))
      .map((field) => [field, source[field]])
  );

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validAppointmentDate(value) {
  return (
    (typeof value === "string" || value instanceof Date) &&
    !Number.isNaN(new Date(value).getTime())
  );
}

function handleAppointmentError(res, error, operation) {
  console.error(`${operation} Error:`, error);
  if (
    error.name === "CastError" ||
    error.name === "ValidationError" ||
    error.name === "StrictModeError"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment data",
    });
  }
  return res.status(500).json({
    success: false,
    message: `Failed to ${operation.toLowerCase()}`,
  });
}

// =====================================
// CREATE APPOINTMENT
// =====================================
const createAppointment = async (req, res) => { // constt createAppoinment = async(req,res) => {                    
  try {
    const {
      patient,
      appointmentDate,
      appointmentType,
      doctorName,
      department,
      notes,
      status = "scheduled",
    } = req.body || {};

    // Required fields
    if (!patient || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Patient and appointment date are required",
      });
    }
    if (!validObjectId(patient)) {
      return res.status(400).json({
        success: false,
        message: "A valid patient ID is required",
      });
    }
    if (!validAppointmentDate(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: "A valid appointment date and time are required",
      });
    }
    if (
      !["scheduled", "confirmed", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    // Check whether patient exists
    const existingPatient = await Patient.findOne({
      _id: patient,
      createdBy: req.user.userId,
    });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient,
      createdBy: req.user.userId,
      appointmentDate,
      appointmentType,
      doctorName,
      department,
      notes,
      status,
    });

    // Return populated appointment
    const populatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("patient", "name email phone")
        .populate("createdBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    return handleAppointmentError(res, error, "Create Appointment");
  }
};

// =====================================
// GET ALL APPOINTMENTS
// =====================================
const getAppointments = async (req, res) => {
  try {
    const patients = await Patient.find({
      createdBy: req.user.userId,
    }).select("_id");
    const appointments = await Appointment.find({
      createdBy: req.user.userId,
      patient: { $in: patients.map((patient) => patient._id) },
    })
      .populate("patient", "name email phone age gender")
      .populate("createdBy", "name email role")
      .sort({ appointmentDate: 1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return handleAppointmentError(res, error, "Fetch Appointments");
  }
};

// =====================================
// GET APPOINTMENT BY ID
// =====================================
const getAppointmentById = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (
      !appointment ||
      !(await Patient.exists({
        _id: appointment.patient,
        createdBy: req.user.userId,
      }))
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    await appointment.populate("patient", "name email phone age gender");
    await appointment.populate("createdBy", "name email role");

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    return handleAppointmentError(res, error, "Fetch Appointment");
  }
};

// =====================================
// UPDATE APPOINTMENT
// =====================================
const updateAppointment = async (req, res) => {
  try {
    const updates = pickFields(req.body || {}, APPOINTMENT_UPDATE_FIELDS);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one appointment field must be provided",
      });
    }
    if (Object.hasOwn(updates, "patient")) {
      if (!validObjectId(updates.patient)) {
        return res.status(400).json({
          success: false,
          message: "A valid patient ID is required",
        });
      }
    }
    if (
      Object.hasOwn(updates, "appointmentDate") &&
      !validAppointmentDate(updates.appointmentDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid appointment date and time are required",
      });
    }

    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }
    const existingAppointment = await Appointment.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });
    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    if (
      !(await Patient.exists({
        _id: existingAppointment.patient,
        createdBy: req.user.userId,
      }))
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (Object.hasOwn(updates, "patient")) {
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

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name email phone age gender")
      .populate("createdBy", "name email role");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    return handleAppointmentError(res, error, "Update Appointment");
  }
};

// =====================================
// UPDATE APPOINTMENT STATUS
// =====================================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body || {};

    const allowedStatuses = [
      "--Select--",
      "scheduled",
      "confirmed",
      "completed",
      "cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use scheduled, confirmed, completed or cancelled",
      });
    }
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const existingAppointment = await Appointment.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });
    if (
      !existingAppointment ||
      !(await Patient.exists({
        _id: existingAppointment.patient,
        createdBy: req.user.userId,
      }))
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name email phone age gender")
      .populate("createdBy", "name email role");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    return handleAppointmentError(res, error, "Update Appointment Status");
  }
};

// =====================================
// DELETE APPOINTMENT
// =====================================
const deleteAppointment = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (
      !appointment ||
      !(await Patient.exists({
        _id: appointment.patient,
        createdBy: req.user.userId,
      }))
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    await Appointment.deleteOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    return handleAppointmentError(res, error, "Delete Appointment");
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};