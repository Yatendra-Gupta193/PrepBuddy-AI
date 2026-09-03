import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft, ShieldCheck,
  User, CalendarDays,
  CheckCircle2, Clock3,
  MessageCircle, Bell,
  FileText, Phone,
  Mail, X, Pencil, Save,
} from "lucide-react"

const defaultPatients = [
  {
    id: "PB-1024",
    initials: "RS",
    name: "Rahul Sharma",
    age: 42,
    procedure: "Colonoscopy",
    date: "Aug 24, 2026",
    time: "10:30 AM",
    progress: 92,
    status: "Ready",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
  },
  {
    id: "PB-1025",
    initials: "AP",
    name: "Anjali Patel",
    age: 36,
    procedure: "Endoscopy",
    date: "Aug 24, 2026",
    time: "02:00 PM",
    progress: 64,
    status: "At Risk",
    phone: "+91 98765 43211",
    email: "anjali@example.com",
  },
  {
    id: "PB-1026",
    initials: "VK",
    name: "Vikram Kumar",
    age: 51,
    procedure: "Colonoscopy",
    date: "Aug 25, 2026",
    time: "09:00 AM",
    progress: 38,
    status: "Critical",
    phone: "+91 98765 43212",
    email: "vikram@example.com",
  },
  {
    id: "PB-1027",
    initials: "SM",
    name: "Sneha Mehta",
    age: 29,
    procedure: "Endoscopy",
    date: "Aug 25, 2026",
    time: "11:30 AM",
    progress: 81,
    status: "In Progress",
    phone: "+91 98765 43213",
    email: "sneha@example.com",
  },
  {
    id: "PB-1028",
    initials: "AM",
    name: "Amit Malhotra",
    age: 45,
    procedure: "Colonoscopy",
    date: "Aug 26, 2026",
    time: "09:30 AM",
    progress: 76,
    status: "In Progress",
    phone: "+91 98765 43214",
    email: "amit@example.com",
  },
  {
    id: "PB-1029",
    initials: "NK",
    name: "Neha Kapoor",
    age: 33,
    procedure: "Endoscopy",
    date: "Aug 26, 2026",
    time: "01:00 PM",
    progress: 95,
    status: "Ready",
    phone: "+91 98765 43215",
    email: "neha@example.com",
  },
]

function normalizePatient(patient) {
  if (!patient) return null

  return {
    ...patient,
    // Procedures.jsx stores these fields.
    // Keep date/time aliases for backward compatibility with older records.
    date: patient.procedureDate || patient.date || "",
    time: patient.procedureTime || patient.time || "",
  }
}

function getStoredPatients() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("prepbuddy_patients") || "[]"
    )

    return Array.isArray(saved) ? saved : []
  } catch (error) {
    console.error("Error reading patients:", error)
    return []
  }
}

function saveStoredPatients(patients) {
  localStorage.setItem(
    "prepbuddy_patients",
    JSON.stringify(patients)
  )

  window.dispatchEvent(
    new Event("prepbuddy-patients-updated")
  )
}

function formatProcedureDate(date) {
  if (!date) return "Not scheduled"

  // Stored scheduling dates are normally YYYY-MM-DD.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = new Date(`${date}T00:00:00`)

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
  }

  return date
}


function PatientDetails() {
  const { id } = useParams()

  const [patient, setPatient] = useState(null)

  const [showContact, setShowContact] = useState(false)
  const [showProtocol, setShowProtocol] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [message, setMessage] = useState("")
  const [reminderSent, setReminderSent] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    procedure: "",
    date: "",
    time: "",
  })

  // --------------------------------------------------
  // LOAD PATIENT
  // --------------------------------------------------

  useEffect(() => {
    const loadPatient = () => {
      try {
        const savedPatients = getStoredPatients()

        // Prefer the live patient record from localStorage.
        // This keeps PatientDetails in sync with Procedures.jsx.
        const savedPatient = savedPatients.find(
          (item) => item.id === id
        )

        if (savedPatient) {
          setPatient(normalizePatient(savedPatient))
          return
        }

        // Fall back to demo patients only when no live record exists.
        const fallbackPatient = defaultPatients.find(
          (item) => item.id === id
        )

        setPatient(normalizePatient(fallbackPatient) || null)
      } catch (error) {
        console.error("Error loading patient:", error)
        setPatient(null)
      }
    }

    loadPatient()

    const refreshPatient = () => loadPatient()

    window.addEventListener(
      "prepbuddy-patients-updated",
      refreshPatient
    )

    window.addEventListener("storage", refreshPatient)

    return () => {
      window.removeEventListener(
        "prepbuddy-patients-updated",
        refreshPatient
      )
      window.removeEventListener("storage", refreshPatient)
    }
  }, [id])

  // --------------------------------------------------
  // SEND REMINDER
  // --------------------------------------------------

  const handleSendReminder = () => {
    if (!patient) return

    try {
      const savedReminders = JSON.parse(
        localStorage.getItem("prepbuddy_reminders") || "[]"
      )

      const newReminder = {
        id: `REM-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        procedure: patient.procedure,
        date: patient.procedureDate || patient.date,
        time: patient.procedureTime || patient.time,
        createdAt: new Date().toISOString(),
        status: "Sent",
      }

      const updatedReminders = [
        ...savedReminders,
        newReminder,
      ]

      localStorage.setItem(
        "prepbuddy_reminders",
        JSON.stringify(updatedReminders)
      )

      setReminderSent(true)

      setTimeout(() => {
        setReminderSent(false)
      }, 3000)
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const handleSendMessage = () => {
    if (!patient?.email) {
      setMessage("Patient email is not available.")
      return
    }

    const subject = encodeURIComponent(
      `PrepBuddy - ${patient.procedure} Preparation`
    )

    const body = encodeURIComponent(
      `Hello ${patient.name},

This is a reminder from PrepBuddy regarding your upcoming ${patient.procedure} scheduled on ${
        formatProcedureDate(patient.procedureDate || patient.date)
      } at ${patient.procedureTime || patient.time || "the scheduled time"}.

Please make sure you complete all preparation instructions before your procedure.

Regards,
PrepBuddy Clinic Management`
    )

    window.location.href =
      `mailto:${patient.email}?subject=${subject}&body=${body}`
  }

  // --------------------------------------------------
  // CONTACT PATIENT
  // --------------------------------------------------

  const handleCallPatient = () => {
    if (!patient?.phone) {
      setMessage("Patient phone number is not available.")
      return
    }

    window.location.href = `tel:${patient.phone.replace(/\s/g, "")}`
  }

  const handleEmailPatient = () => {
    if (!patient?.email) {
      setMessage("Patient email is not available.")
      return
    }

    window.location.href = `mailto:${patient.email}`
  }

  // --------------------------------------------------
  // PREPARATION STEPS
  // --------------------------------------------------

  const getPreparationSteps = () => {
    const progress = patient?.progress || 0

    return [
      {
        title: "Preparation instructions reviewed",
        completed: progress >= 20,
      },
      {
        title: "Patient confirmation received",
        completed: progress >= 50,
      },
      {
        title: "Final preparation check",
        completed: progress >= 80,
      },
      {
        title: "Procedure readiness confirmed",
        completed: progress >= 100,
      },
    ]
  }

  const preparationSteps = patient
    ? getPreparationSteps()
    : []

  const completedSteps = preparationSteps.filter(
    (step) => step.completed
  ).length

  // --------------------------------------------------
  // MARK CURRENT STEP COMPLETE
  // --------------------------------------------------

  const handleMarkComplete = () => {
    if (!patient) return

    const progressSteps = [20, 50, 80, 100]

    const currentProgress = patient.progress || 0

    const nextProgress =
      progressSteps.find((value) => value > currentProgress) || 95

    const updatedPatient = {
      ...patient,
      progress: nextProgress,
      status:
        nextProgress >= 100
          ? "Ready"
          : "In Progress",
    }

    setPatient(updatedPatient)

    // Save updated patient
    try {
      const savedPatients = getStoredPatients()

      const isSavedPatient = savedPatients.some(
        (item) => item.id === patient.id
      )

      if (isSavedPatient) {
        const updatedPatients = savedPatients.map((item) =>
          item.id === patient.id
            ? {
                ...item,
                ...updatedPatient,
              }
            : item
        )

        saveStoredPatients(updatedPatients)
      }
    } catch (error) {
      console.error("Error updating preparation:", error)
    }

    setMessage(
      nextProgress >= 100
        ? "Patient preparation is now complete."
        : "Preparation step marked as complete."
    )

    setTimeout(() => {
      setMessage("")
    }, 3000)
  }

  // --------------------------------------------------
  // EDIT PATIENT
  // --------------------------------------------------

  const handleEditPatient = () => {
    if (!patient) return

    setEditForm({
      name: patient.name || "",
      age: patient.age || "",
      phone: patient.phone || "",
      email: patient.email || "",
      procedure: patient.procedure || "",
      date: patient.procedureDate || patient.date || "",
      time: patient.procedureTime || patient.time || "",
    })

    setShowEditModal(true)
  }

  // --------------------------------------------------
  // EDIT INPUT CHANGE
  // --------------------------------------------------

  const handleEditChange = (event) => {
    const { name, value } = event.target

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // --------------------------------------------------
  // SAVE EDITED PATIENT
  // --------------------------------------------------

  const handleSaveEdit = () => {
    if (!patient) return

    if (!editForm.name.trim()) {
      setMessage("Patient name is required.")
      return
    }

    const updatedPatient = {
      ...patient,

      name: editForm.name.trim(),

      initials: editForm.name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),

      age: Number(editForm.age) || patient.age,

      phone: editForm.phone.trim(),

      email: editForm.email.trim(),

      procedure:
        editForm.procedure.trim() || patient.procedure,

      // Keep both field names so all PrepBuddy modules stay compatible.
      procedureDate:
        editForm.date.trim() ||
        patient.procedureDate ||
        patient.date ||
        "",

      procedureTime:
        editForm.time.trim() ||
        patient.procedureTime ||
        patient.time ||
        "",

      date:
        editForm.date.trim() ||
        patient.procedureDate ||
        patient.date ||
        "",

      time:
        editForm.time.trim() ||
        patient.procedureTime ||
        patient.time ||
        "",
    }

    setPatient(normalizePatient(updatedPatient))

    try {
      const savedPatients = getStoredPatients()

      const existingIndex = savedPatients.findIndex(
        (item) => item.id === patient.id
      )

      if (existingIndex !== -1) {
        const updatedPatients = [...savedPatients]

        updatedPatients[existingIndex] = updatedPatient

        saveStoredPatients(updatedPatients)
      } else {
        // For safety, only update saved patients.
        // Default patients remain static.
      }

      setShowEditModal(false)

      setMessage("Patient details updated successfully.")

      setTimeout(() => {
        setMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error saving patient:", error)
      setMessage("Unable to save patient details.")
    }
  }

  // --------------------------------------------------
  // PATIENT NOT FOUND
  // --------------------------------------------------

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Patient Not Found
          </h1>

          <p className="mt-3 text-slate-500">
            No patient exists with ID: {id}
          </p>

          <Link
            to="/patients"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            <ArrowLeft size={17} />
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">

          <Link
            to="/clinic-dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                PrepBuddy
              </h1>

              <p className="text-[10px] text-slate-500">
                Clinic Management
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-400">
              CS
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                Clinic Staff
              </p>

              <p className="text-xs text-slate-500">
                City Care Clinic
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="pt-16">

        <div className="mx-auto max-w-6xl p-6 lg:p-8">

          {/* BACK */}

          <Link
            to="/patients"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Patients
          </Link>

          {/* SUCCESS MESSAGE */}

          {reminderSent && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              <CheckCircle2 size={18} />
              Reminder sent successfully to {patient.name}.
            </div>
          )}

          {/* GENERAL MESSAGE */}

          {message && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">

              <span>
                {message}
              </span>

              <button
                type="button"
                onClick={() => setMessage("")}
                className="rounded-lg p-1 hover:bg-blue-500/10"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* =================================================
              PATIENT HEADER
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-xl font-bold text-blue-400">
                  {patient.initials}
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-3xl font-bold">
                      {patient.name}
                    </h1>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">

                      <CheckCircle2 size={13} />

                      {patient.status}

                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Patient ID: {patient.id}
                  </p>

                </div>
              </div>

              {/* HEADER ACTIONS */}

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={handleEditPatient}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                >
                  <Pencil size={17} />
                  Edit Patient
                </button>

                <button
                  type="button"
                  onClick={() => setShowContact(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                >
                  <MessageCircle size={17} />
                  Contact Patient
                </button>

              </div>

            </div>
          </div>

          {/* =================================================
              TOP CARDS
          ================================================== */}

          <div className="mb-6 grid gap-5 md:grid-cols-3">

            {/* PROCEDURE */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <CalendarDays size={20} />
                </div>

                <p className="text-sm text-slate-500">
                  Procedure
                </p>

              </div>

              <h2 className="text-lg font-bold">
                {patient.procedure}
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Scheduled procedure
              </p>

            </div>

            {/* DATE */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  <CalendarDays size={20} />
                </div>

                <p className="text-sm text-slate-500">
                  Procedure Date
                </p>

              </div>

              <h2 className="text-lg font-bold">
                {formatProcedureDate(
                  patient.procedureDate || patient.date
                )}
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                {patient.procedureTime || patient.time || "Not scheduled"}
              </p>

            </div>

            {/* PREPARATION */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                    <CheckCircle2 size={20} />
                  </div>

                  <p className="text-sm text-slate-500">
                    Preparation
                  </p>

                </div>

                <span className="text-sm text-emerald-400">
                  {patient.status}
                </span>

              </div>

              <h2 className="text-2xl font-bold">
                {patient.progress}%
              </h2>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${patient.progress}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* =================================================
              INFORMATION + QUICK ACTIONS
          ================================================== */}

          <div className="grid gap-6 lg:grid-cols-3">

            {/* PATIENT INFORMATION */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">

              <div className="mb-6 flex items-center gap-3">

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <User size={20} />
                </div>

                <div>

                  <h2 className="font-bold">
                    Patient Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Basic patient details
                  </p>

                </div>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <p className="text-xs text-slate-500">
                    Full Name
                  </p>

                  <p className="mt-2 font-medium">
                    {patient.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Age
                  </p>

                  <p className="mt-2 font-medium">
                    {patient.age} years
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Phone
                  </p>

                  <p className="mt-2 flex items-center gap-2 font-medium">
                    <Phone
                      size={15}
                      className="text-slate-500"
                    />

                    {patient.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="mt-2 flex items-center gap-2 font-medium">
                    <Mail
                      size={15}
                      className="text-slate-500"
                    />

                    {patient.email || "Not provided"}
                  </p>
                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

              <h2 className="mb-5 font-bold">
                Quick Actions
              </h2>

              <div className="space-y-3">

                {/* REMINDER */}

                <button
                  type="button"
                  onClick={handleSendReminder}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-800 p-4 text-left text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                >
                  <Bell
                    size={18}
                    className="text-blue-400"
                  />

                  Send Reminder
                </button>

                {/* MESSAGE */}

                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-800 p-4 text-left text-sm text-slate-300 transition hover:border-emerald-500 hover:text-white"
                >
                  <MessageCircle
                    size={18}
                    className="text-emerald-400"
                  />

                  Send Message
                </button>

                {/* PROTOCOL */}

                <button
                  type="button"
                  onClick={() => setShowProtocol(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-800 p-4 text-left text-sm text-slate-300 transition hover:border-purple-500 hover:text-white"
                >
                  <FileText
                    size={18}
                    className="text-purple-400"
                  />

                  View Protocol
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              PREPARATION TIMELINE
          ================================================== */}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-bold">
                  Preparation Timeline
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Patient preparation milestones
                </p>

              </div>

              <span className="text-sm font-medium text-emerald-400">
                {completedSteps} / {preparationSteps.length} completed
              </span>

            </div>

            <div className="mt-6 space-y-4">

              {preparationSteps.map((step, index) => {

                const isCurrentStep =
                  !step.completed &&
                  index === completedSteps

                return (
                  <div
                    key={step.title}
                    className="flex items-center gap-4"
                  >

                    <div
                      className={`rounded-full p-2 ${
                        step.completed
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isCurrentStep
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >

                      {step.completed ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Clock3 size={16} />
                      )}

                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-medium">
                        {step.title}
                      </p>

                      <p className="text-xs text-slate-600">

                        {step.completed
                          ? "Completed"
                          : isCurrentStep
                          ? "In progress"
                          : "Pending"}

                      </p>

                    </div>

                    {/* MARK COMPLETE */}

                    {isCurrentStep && (
                      <button
                        type="button"
                        onClick={handleMarkComplete}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Mark Complete
                      </button>
                    )}

                  </div>
                )
              })}

            </div>

          </div>

        </div>
      </main>

      {/* =====================================================
          CONTACT MODAL
      ====================================================== */}

      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Contact Patient
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose how you want to contact {patient.name}.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowContact(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            <div className="space-y-3">

              {/* CALL */}

              <button
                type="button"
                onClick={handleCallPatient}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-800 p-4 text-left hover:border-blue-500"
              >

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Phone size={20} />
                </div>

                <div>

                  <p className="font-medium">
                    Call Patient
                  </p>

                  <p className="text-xs text-slate-500">
                    {patient.phone || "Phone unavailable"}
                  </p>

                </div>

              </button>

              {/* EMAIL */}

              <button
                type="button"
                onClick={handleEmailPatient}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-800 p-4 text-left hover:border-emerald-500"
              >

                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                  <Mail size={20} />
                </div>

                <div>

                  <p className="font-medium">
                    Send Email
                  </p>

                  <p className="text-xs text-slate-500">
                    {patient.email || "Email unavailable"}
                  </p>

                </div>

              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          PROTOCOL MODAL
      ====================================================== */}

      {showProtocol && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  <FileText size={20} />
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Procedure Protocol
                  </h2>

                  <p className="text-xs text-slate-500">
                    {patient.procedure}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setShowProtocol(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            <div className="space-y-4">

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                <p className="text-sm font-medium">
                  Procedure
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {patient.procedure}
                </p>

              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                <p className="text-sm font-medium">
                  Scheduled Date
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatProcedureDate(patient.procedureDate || patient.date)} at{" "}
                  {patient.procedureTime || patient.time || "Not scheduled"}
                </p>

              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                <p className="text-sm font-medium">
                  Preparation Requirements
                </p>

                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li>• Follow clinic preparation instructions.</li>
                  <li>• Complete patient confirmation.</li>
                  <li>• Complete final preparation check.</li>
                  <li>• Contact the clinic for any concerns.</li>
                </ul>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setShowProtocol(false)}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              Close Protocol
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT PATIENT MODAL
      ====================================================== */}

      {showEditModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Edit Patient
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update patient information
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <div className="grid gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* AGE */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={editForm.age}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* PROCEDURE */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Procedure
                </label>

                <input
                  type="text"
                  name="procedure"
                  value={editForm.procedure}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Procedure Date
                </label>

                <input
                  type="text"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  placeholder="e.g. Aug 28, 2026"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* TIME */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Procedure Time
                </label>

                <input
                  type="text"
                  name="time"
                  value={editForm.time}
                  onChange={handleEditChange}
                  placeholder="e.g. 10:30 AM"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Save size={17} />
                Save Changes
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default PatientDetails