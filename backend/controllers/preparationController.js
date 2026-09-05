const Preparation = require("../models/preparation");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");

// Create Preparation
const createPreparation = async (req, res) => {
  try {
    const { patient, appointment, steps = [] } = req.body;

    if (!patient || !appointment) {
      return res.status(400).json({
        success: false,
        message: "Patient and appointment are required",
      });
    }

    // Verify patient belongs to logged-in user
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

    // Verify appointment belongs to logged-in user
    const existingAppointment = await Appointment.findOne({
      _id: appointment,
      createdBy: req.user.userId,
      patient: patient,
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Prevent duplicate preparation plan for same appointment
    const existingPreparation = await Preparation.findOne({
      appointment,
      createdBy: req.user.userId,
    });

    if (existingPreparation) {
      return res.status(409).json({
        success: false,
        message: "Preparation plan already exists for this appointment",
      });
    }

    const preparation = await Preparation.create({
      patient,
      appointment,
      steps,
      createdBy: req.user.userId,
    });

    const populatedPreparation = await Preparation.findById(
      preparation._id
    )
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Preparation plan created successfully",
      preparation: populatedPreparation,
    });
  } catch (error) {
    console.error("Create preparation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get All Preparations
const getPreparations = async (req, res) => {
  try {
    const preparations = await Preparation.find({
      createdBy: req.user.userId,
    })
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: preparations.length,
      preparations,
    });
  } catch (error) {
    console.error("Get preparations error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get Preparation By ID
const getPreparationById = async (req, res) => {
  try {
    const preparation = await Preparation.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    })
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      )
      .populate("createdBy", "name email");

    if (!preparation) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found",
      });
    }

    res.status(200).json({
      success: true,
      preparation,
    });
  } catch (error) {
    console.error("Get preparation by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update Preparation
const updatePreparation = async (req, res) => {
  try {
    const { steps, status, progress } = req.body;

    const preparation = await Preparation.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!preparation) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found",
      });
    }

    if (steps !== undefined) {
      preparation.steps = steps;
    }

    if (status !== undefined) {
      preparation.status = status;
    }

    if (progress !== undefined) {
      preparation.progress = progress;
    }

    await preparation.save();

    const updatedPreparation = await Preparation.findById(preparation._id)
      .populate("patient", "name email phone")
      .populate(
        "appointment",
        "appointmentDate appointmentType doctorName department status"
      );

    res.status(200).json({
      success: true,
      message: "Preparation plan updated successfully",
      preparation: updatedPreparation,
    });
  } catch (error) {
    console.error("Update preparation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Complete / Toggle Preparation Step
const updatePreparationStep = async (req, res) => {
  try {
    const { stepId, completed } = req.body;

    if (!stepId || completed === undefined) {
      return res.status(400).json({
        success: false,
        message: "stepId and completed are required",
      });
    }

    const preparation = await Preparation.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!preparation) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found",
      });
    }

    const step = preparation.steps.id(stepId);

    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Preparation step not found",
      });
    }

    step.completed = completed;

    if (completed) {
      step.completedAt = new Date();
    } else {
      step.completedAt = null;
    }

    const totalSteps = preparation.steps.length;
    const completedSteps = preparation.steps.filter(
      (item) => item.completed
    ).length;

    if (totalSteps === 0) {
      preparation.progress = 0;
      preparation.status = "not_started";
    } else {
      preparation.progress = Math.round(
        (completedSteps / totalSteps) * 100
      );

      if (preparation.progress === 0) {
        preparation.status = "not_started";
      } else if (preparation.progress === 100) {
        preparation.status = "completed";
      } else {
        preparation.status = "in_progress";
      }
    }

    await preparation.save();

    res.status(200).json({
      success: true,
      message: "Preparation step updated successfully",
      preparation,
    });
  } catch (error) {
    console.error("Update preparation step error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete Preparation
const deletePreparation = async (req, res) => {
  try {
    const preparation = await Preparation.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!preparation) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preparation plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete preparation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createPreparation,
  getPreparations,
  getPreparationById,
  updatePreparation,
  updatePreparationStep,
  deletePreparation,
};