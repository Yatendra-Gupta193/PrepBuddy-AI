const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  updateReminderStatus,
  deleteReminder,
} = require("../controllers/reminderController");

// Protect all reminder routes
router.use(authMiddleware);

// Create reminder
router.post("/", createReminder);

// Get all reminders
router.get("/", getReminders);

// Get reminder by ID
router.get("/:id", getReminderById);

// Update reminder
router.put("/:id", updateReminder);

// Update reminder status
router.patch("/:id/status", updateReminderStatus);

// Delete reminder
router.delete("/:id", deleteReminder);

module.exports = router;