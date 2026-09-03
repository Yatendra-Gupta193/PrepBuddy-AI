const express = require("express");

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// PATIENT ROUTES
// =====================================

// Create patient
router.post("/", authMiddleware, createPatient);

// Get all patients
router.get("/", authMiddleware, getPatients);

// Get single patient
router.get("/:id", authMiddleware, getPatientById);

// Update patient
router.put("/:id", authMiddleware, updatePatient);

// Delete patient
router.delete("/:id", authMiddleware, deletePatient);

module.exports = router;