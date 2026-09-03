const express = require("express");

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create appointment
router.post("/", authMiddleware, createAppointment);

// Get all appointments
router.get("/", authMiddleware, getAppointments);

// Get appointment by ID
router.get("/:id", authMiddleware, getAppointmentById);

// Update appointment
router.put("/:id", authMiddleware, updateAppointment);

// Update appointment status
router.patch(
  "/:id/status",
  authMiddleware,
  updateAppointmentStatus
);

// Delete appointment
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router; 