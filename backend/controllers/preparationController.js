<<<<<<< HEAD
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
=======
const Patient = require("../models/patient");
const {
  buildDefaultSteps,
  getChecklistSummary,
  migratePatientChecklist,
} = require("../utils/preparationChecklist");

const LEGACY_STATUSES = ["pending", "in_progress", "completed"];
const PREPARATION_STATUSES = ["not_started", ...LEGACY_STATUSES];

function serializePreparation(patient) {
  const summary = getChecklistSummary(patient.preparationSteps);
  return {
    patientId: patient._id,
    patientName: patient.name,
    procedure: patient.procedure || "",
    steps: patient.preparationSteps.map((step) => ({
      id: step._id,
      title: step.title,
      completed: step.completed,
    })),
    ...summary,
    preparationStatus: summary.status,
    updatedAt: patient.updatedAt,
  };
}

async function findOwnedPatient(patientId, userId) {
  const patient = await Patient.findOne({
    _id: patientId,
    createdBy: userId,
  });
  return patient ? migratePatientChecklist(patient) : null;
}

function validateSteps(steps) {
  return (
    Array.isArray(steps) &&
    steps.every(
      (step) =>
        step &&
        typeof step.title === "string" &&
        step.title.trim().length > 0 &&
        (step.completed === undefined || typeof step.completed === "boolean")
    )
  );
}

async function getPreparations(req, res) {
  try {
    const patients = await Patient.find({ createdBy: req.user.userId }).sort({
      updatedAt: -1,
    });
    const preparations = (
      await Promise.all(
        patients.map((patient) => migratePatientChecklist(patient))
      )
    ).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: preparations.length,
      preparations: preparations.map(serializePreparation),
    });
  } catch (error) {
    console.error("Get Preparations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch preparations",
    });
  }
}

async function getPreparation(req, res) {
  try {
    const patient = await findOwnedPatient(req.params.patientId, req.user.userId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient preparation not found",
      });
    }

    return res.status(200).json({
      success: true,
      preparation: serializePreparation(patient),
    });
  } catch (error) {
    console.error("Get Preparation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch preparation",
    });
  }
}

async function createChecklist(req, res) {
  try {
    const { steps } = req.body;
    if (steps !== undefined && !validateSteps(steps)) {
      return res.status(400).json({
        success: false,
        message: "Each checklist step must have a title and a boolean completion state",
      });
    }

    const patient = await Patient.findOne({
      _id: req.params.patientId,
      createdBy: req.user.userId,
    });
    if (!patient) {
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

<<<<<<< HEAD
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

=======
    if (!patient.preparationChecklistInitialized) {
      const checklistSteps =
        steps === undefined
          ? buildDefaultSteps(patient.preparationStatus)
          : steps.map((step) => ({
              title: step.title.trim(),
              completed: step.completed === true,
            }));
      const summary = getChecklistSummary(checklistSteps);
      await Patient.updateOne(
        {
          _id: patient._id,
          createdBy: req.user.userId,
          preparationChecklistInitialized: { $ne: true },
        },
        {
          $set: {
            preparationSteps: checklistSteps,
            preparationChecklistInitialized: true,
            preparationStatus: summary.status,
          },
        },
        { runValidators: true }
      );
    }

    const updatedPatient = await findOwnedPatient(
      req.params.patientId,
      req.user.userId
    );
    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient preparation not found",
      });
    }
    return res.status(200).json({
      success: true,
      preparation: serializePreparation(updatedPatient),
    });
  } catch (error) {
    console.error("Create Preparation Checklist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create preparation checklist",
    });
  }
}

async function updatePreparationStep(req, res) {
  try {
    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Step completion must be true or false",
      });
    }

    const patient = await findOwnedPatient(req.params.patientId, req.user.userId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient preparation not found",
      });
    }

    const step = patient.preparationSteps.id(req.params.stepId);
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Preparation step not found",
      });
    }

<<<<<<< HEAD
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
=======
    step.completed = req.body.completed;
    const summary = getChecklistSummary(patient.preparationSteps);
    patient.preparationStatus = summary.status;
    await patient.save();

    return res.status(200).json({
      success: true,
      preparation: serializePreparation(patient),
    });
  } catch (error) {
    console.error("Update Preparation Step Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update preparation step",
    });
  }
}

async function updatePreparation(req, res) {
  try {
    const { status } = req.body;
    if (!PREPARATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preparation status",
      });
    }

    const patient = await findOwnedPatient(req.params.patientId, req.user.userId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient preparation not found",
      });
    }

    const steps = patient.preparationSteps;
    if (status === "completed" && steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An empty checklist cannot be marked completed",
      });
    }
    if (status === "in_progress" && steps.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two checklist steps are needed for in-progress status",
      });
    }

    const completedCount =
      status === "completed"
        ? steps.length
        : status === "in_progress"
          ? Math.floor(steps.length / 2)
          : 0;
    steps.forEach((step, index) => {
      step.completed = index < completedCount;
    });
    const summary = getChecklistSummary(steps);
    patient.preparationStatus = summary.status;
    await patient.save();

    return res.status(200).json({
      success: true,
      preparation: serializePreparation(patient),
    });
  } catch (error) {
    console.error("Update Preparation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update preparation",
    });
  }
}

module.exports = {
  getPreparations,
  getPreparation,
  createChecklist,
  updatePreparationStep,
  updatePreparation,
};
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
