const Patient = require("../models/patient");

const DEFAULT_PREPARATION_STEPS = [
  "Preparation instructions reviewed",
  "Patient confirmation received",
  "Final preparation check",
  "Procedure readiness confirmed",
];

function buildDefaultSteps(legacyStatus = "not_started") {
  const completedCount =
    legacyStatus === "completed"
      ? DEFAULT_PREPARATION_STEPS.length
      : legacyStatus === "in_progress"
        ? Math.floor(DEFAULT_PREPARATION_STEPS.length / 2)
        : 0;

  return DEFAULT_PREPARATION_STEPS.map((title, index) => ({
    title,
    completed: index < completedCount,
  }));
}

function getChecklistSummary(steps = []) {
  const totalSteps = steps.length;
  const completedSteps = steps.filter((step) => step.completed).length;

  return {
    totalSteps,
    completedSteps,
    progress:
      totalSteps === 0
        ? 0
        : Math.round((completedSteps / totalSteps) * 100),
    status:
      totalSteps === 0 || completedSteps === 0
        ? "not_started"
        : completedSteps === totalSteps
          ? "completed"
          : "in_progress",
  };
}

async function migratePatientChecklist(patient) {
  if (patient.preparationChecklistInitialized) return patient;

  const preparationSteps = buildDefaultSteps(patient.preparationStatus);
  const summary = getChecklistSummary(preparationSteps);

  await Patient.updateOne(
    {
      _id: patient._id,
      createdBy: patient.createdBy,
      preparationChecklistInitialized: { $ne: true },
    },
    {
      $set: {
        preparationSteps,
        preparationChecklistInitialized: true,
        preparationStatus: summary.status,
      },
    },
    { runValidators: true }
  );

  return Patient.findOne({
    _id: patient._id,
    createdBy: patient.createdBy,
  });
}

module.exports = {
  DEFAULT_PREPARATION_STEPS,
  buildDefaultSteps,
  getChecklistSummary,
  migratePatientChecklist,
};
