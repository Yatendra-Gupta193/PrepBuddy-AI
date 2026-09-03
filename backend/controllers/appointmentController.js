const Appointment = require("../models/appointment");
const Patient = require("../models/patient");

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
    } = req.body;

    // Required fields
    if (!patient || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Patient and appointment date are required",
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
    console.error("Create Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
};

// =====================================
// GET ALL APPOINTMENTS
// =====================================
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      createdBy: req.user.userId,
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
    console.error("Get Appointments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

// =====================================
// GET APPOINTMENT BY ID
// =====================================
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    })
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
      appointment,
    });
  } catch (error) {
    console.error("Get Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
};

// =====================================
// UPDATE APPOINTMENT
// =====================================
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId,
      },
      req.body,
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
    console.error("Update Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment",
    });
  }
};

// =====================================
// UPDATE APPOINTMENT STATUS
// =====================================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
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
    console.error("Update Appointment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
    });
  }
};

// =====================================
// DELETE APPOINTMENT
// =====================================
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
    });
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