const Patient = require("../models/patient");

// =====================================
// CREATE PATIENT
// =====================================
const createPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      gender,
      diagnosis,
      procedure,
      procedureDate,
      medicalHistory,
      allergies,
      medications,
    } = req.body;

    // Required fields
    if (!name || !phone || age === undefined || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, age and gender are required",
      });
    }

    // Create patient
    const patient = await Patient.create({
      name,
      email,
      phone,
      age,
      gender,
      diagnosis,
      procedure,
      procedureDate,
      medicalHistory,
      allergies,
      medications,

      // authMiddleware should provide logged-in user
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.error("Create Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create patient",
    });
  }
};

// =====================================
// GET ALL PATIENTS
// =====================================
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get Patients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
    });
  }
};

// =====================================
// GET SINGLE PATIENT
// =====================================
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
    });
  }
};

// =====================================
// UPDATE PATIENT
// =====================================
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update patient",
    });
  }
};

// =====================================
// DELETE PATIENT
// =====================================
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Delete Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete patient",
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};