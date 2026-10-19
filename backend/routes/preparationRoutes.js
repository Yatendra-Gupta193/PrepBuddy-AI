const express = require("express");
<<<<<<< HEAD
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPreparation,
  getPreparations,
  getPreparationById,
  updatePreparation,
  updatePreparationStep,
  deletePreparation,
} = require("../controllers/preparationController");

// All preparation routes are protected
router.use(authMiddleware);

// Create preparation plan
router.post("/", createPreparation);

// Get all preparation plans
router.get("/", getPreparations);

// Get preparation plan by ID
router.get("/:id", getPreparationById);

// Update preparation plan
router.put("/:id", updatePreparation);

// Update / complete individual preparation step
router.patch("/:id/step", updatePreparationStep);

// Delete preparation plan
router.delete("/:id", deletePreparation);

module.exports = router;
=======
const authMiddleware = require("../middleware/authMiddleware");
const {
  getPreparations,
  getPreparation,
  createChecklist,
  updatePreparationStep,
  updatePreparation,
} = require("../controllers/preparationController");

const router = express.Router();

router.get("/", authMiddleware, getPreparations);
router.get("/:patientId", authMiddleware, getPreparation);
router.post("/:patientId/checklist", authMiddleware, createChecklist);
router.patch(
  "/:patientId/steps/:stepId",
  authMiddleware,
  updatePreparationStep
);
router.patch("/:patientId", authMiddleware, updatePreparation);

module.exports = router;
>>>>>>> 90c58b3 (Save PrepBuddy AI progress)
