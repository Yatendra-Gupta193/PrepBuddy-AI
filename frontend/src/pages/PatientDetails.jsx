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
import {
  api,
  getPatientProgress,
  getPatientStatus,
  notifyPatientsChanged,
  notifyRemindersChanged,
} from "../services/api"
import useAuth from "../hooks/useAuth"
import { localDateTimeToISO, toLocalDateTimeInput } from "../services/dateTime"

function normalizePatient(patient, appointment = null, preparation = null) {
  if (!patient) return null

  const appointmentDate = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate)
    : null
  const appointmentTime =
    appointmentDate && !Number.isNaN(appointmentDate.getTime())
      ? `${String(appointmentDate.getHours()).padStart(2, "0")}:${String(appointmentDate.getMinutes()).padStart(2, "0")}`
      : ""
  const appointmentLocalDate =
    appointmentDate && !Number.isNaN(appointmentDate.getTime())
      ? `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, "0")}-${String(appointmentDate.getDate()).padStart(2, "0")}`
      : ""

  return {
    ...patient,
    id: patient._id,
    preparationSteps: preparation?.steps || patient.preparationSteps || [],
    preparationStatus:
      preparation?.status ||
      preparation?.preparationStatus ||
      patient.preparationStatus,
    progress:
      preparation?.progress ??
      getPatientProgress({
        ...patient,
        preparationSteps: preparation?.steps || patient.preparationSteps || [],
      }),
    status: getPatientStatus({
      ...patient,
      preparationSteps: preparation?.steps || patient.preparationSteps || [],
    }),
    appointmentId: appointment?._id,
    appointmentDate: appointment?.appointmentDate,
    doctor: appointment?.doctorName || "",
    date: appointmentLocalDate,
    time: appointmentTime,
  }
}

function formatProcedureDate(date) {
  if (!date) return "Not scheduled"

  const dateOnly = /^\d{4}-\d{2}-\d{2}/.test(date)
    ? date.slice(0, 10)
    : null
  const parsed = dateOnly
    ? new Date(`${dateOnly}T00:00:00`)
    : new Date(date)

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return date
}


function PatientDetails() {
  const { id } = useParams()
  const { user } = useAuth()

  const [patient, setPatient] = useState(null)

  const [showContact, setShowContact] = useState(false)
  const [showProtocol, setShowProtocol] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [message, setMessage] = useState("")
  const [reminderSent, setReminderSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [preparationLoading, setPreparationLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingStepId, setSavingStepId] = useState("")
  const [creatingChecklist, setCreatingChecklist] = useState(false)
  const [error, setError] = useState("")
  const [preparation, setPreparation] = useState(null)

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
    let active = true
    const loadPatient = async () => {
      setLoading(true)
      setPreparationLoading(true)
      setError("")
      try {
        const [response, appointmentResponse, preparationResponse] =
          await Promise.all([
            api.patients.get(id),
            api.appointments.list(),
            api.preparations.get(id),
          ])
        const appointment = (appointmentResponse.appointments || [])
          .filter(
            (item) =>
              String(item.patient?._id || item.patient) ===
                String(response.patient._id) &&
              item.status !== "cancelled"
          )
          .sort((left, right) => {
            const now = Date.now()
            const leftTime = new Date(left.appointmentDate).getTime()
            const rightTime = new Date(right.appointmentDate).getTime()
            const leftUpcoming = leftTime >= now
            const rightUpcoming = rightTime >= now
            if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1
            return leftUpcoming
              ? leftTime - rightTime
              : rightTime - leftTime
          })[0]
        if (active) {
          setPreparation(preparationResponse.preparation)
          setPatient(
            normalizePatient(
              response.patient,
              appointment,
              preparationResponse.preparation
            )
          )
        }
      } catch (requestError) {
        if (active) {
          setPatient(null)
          setError(requestError.message || "Unable to load this patient.")
        }
      } finally {
        if (active) {
          setLoading(false)
          setPreparationLoading(false)
        }
      }
    }

    loadPatient()

    window.addEventListener(
      "prepbuddy-patients-updated",
      loadPatient
    )
    window.addEventListener(
      "prepbuddy-preparations-updated",
      loadPatient
    )

    return () => {
      active = false
      window.removeEventListener(
        "prepbuddy-patients-updated",
        loadPatient
      )
      window.removeEventListener(
        "prepbuddy-preparations-updated",
        loadPatient
      )
    }
  }, [id])

  // --------------------------------------------------
  // SEND REMINDER
  // --------------------------------------------------

  const handleSendReminder = async () => {
    if (!patient || saving) return
    setSaving(true)
    setError("")
    try {
      await api.reminders.create({
        patient: patient.id,
        type: "Preparation Reminder",
        message: `Please review your preparation instructions for your upcoming ${patient.procedure || "procedure"}.`,
        scheduledAt:
          patient.appointmentDate ||
          new Date().toISOString(),
        channel: patient.email ? "Email" : "Notification",
        status: "Scheduled",
        priority: "Medium",
      })
      notifyRemindersChanged()
      setReminderSent(true)

      setTimeout(() => {
        setReminderSent(false)
      }, 3000)
    } catch (requestError) {
      setError(requestError.message || "Unable to create reminder.")
    } finally {
      setSaving(false)
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
        formatProcedureDate(patient.date)
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

  const preparationSteps = preparation?.steps || []
  const completedSteps = preparationSteps.filter(
    (step) => step.completed
  ).length
  const preparationProgress = preparation?.progress || 0

  const handleTogglePreparationStep = async (step) => {
    if (!patient || savingStepId) return
    setSavingStepId(step.id)
    setError("")
    try {
      const response = await api.preparations.updateStep(
        patient.id,
        step.id,
        !step.completed
      )
      setPreparation(response.preparation)
      setPatient({
        ...patient,
        preparationSteps: response.preparation.steps,
        preparationStatus: response.preparation.status,
        progress: response.preparation.progress,
        status: getPatientStatus({
          preparationSteps: response.preparation.steps,
        }),
      })
      notifyPatientsChanged()
      setMessage("Preparation checklist updated.")
    } catch (requestError) {
      setError(requestError.message || "Unable to update preparation status.")
    } finally {
      setSavingStepId("")
    }
  }

  const handleCreateChecklist = async () => {
    if (!patient || creatingChecklist) return
    setCreatingChecklist(true)
    setError("")
    try {
      const response = await api.preparations.createChecklist(patient.id)
      setPreparation(response.preparation)
      setPatient((current) => ({
        ...current,
        preparationSteps: response.preparation.steps,
        preparationStatus: response.preparation.status,
        progress: response.preparation.progress,
        status: getPatientStatus({
          preparationSteps: response.preparation.steps,
        }),
      }))
      notifyPatientsChanged()
      setMessage("Preparation checklist created.")
    } catch (requestError) {
      setError(requestError.message || "Unable to create preparation checklist.")
    } finally {
      setCreatingChecklist(false)
    }
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
      ...toLocalDateTimeInput(patient.appointmentDate),
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

  const handleSaveEdit = async () => {
    if (!patient || saving) return

    if (
      !editForm.name.trim() ||
      !editForm.age ||
      Number(editForm.age) < 0 ||
      Number(editForm.age) > 120 ||
      !editForm.phone.trim()
    ) {
      setMessage("Name, valid age, and phone number are required.")
      return
    }

    if (Boolean(editForm.date) !== Boolean(editForm.time)) {
      setMessage("Enter both procedure date and time to schedule it.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const response = await api.patients.update(patient.id, {
        name: editForm.name.trim(),
        age: Number(editForm.age),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        procedure: editForm.procedure.trim(),
      })
      let appointment = null

      if (editForm.date && editForm.time) {
        const appointmentData = {
          patient: patient.id,
          appointmentDate: localDateTimeToISO(editForm.date, editForm.time),
          appointmentType: editForm.procedure.trim() || patient.procedure,
          doctorName: patient.doctor || "",
        }
        const appointmentResponse = patient.appointmentId
          ? await api.appointments.update(
              patient.appointmentId,
              appointmentData
            )
          : await api.appointments.create(appointmentData)
        appointment = appointmentResponse.appointment
      } else if (patient.appointmentId) {
        await api.appointments.delete(patient.appointmentId)
      }

      setPatient(normalizePatient(response.patient, appointment))
      notifyPatientsChanged()
      setShowEditModal(false)
      setMessage("Patient details updated successfully.")
    } catch (requestError) {
      setError(requestError.message || "Unable to save patient details.")
    } finally {
      setSaving(false)
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
            {loading ? "Loading Patient..." : error ? "Unable to Load Patient" : "Patient Not Found"}
          </h1>

          <p role={error ? "alert" : undefined} className="mt-3 text-slate-500">
            {error || `No patient exists with ID: ${id}`}
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
              {(user?.name || "Clinic Staff")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                {user?.name || "Clinic Staff"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email || user?.role || "Clinic account"}
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
              Reminder scheduled for this patient. Email and notification delivery are not configured.
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

          {error && (
            <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* =================================================
              PATIENT HEADER
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-xl font-bold text-blue-400">
                  {patient.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
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
                  patient.date
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
                  disabled={saving}
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
                {completedSteps} / {preparationSteps.length} completed ·{" "}
                {preparationProgress}%
              </span>

            </div>

            <div className="mt-6 space-y-4">

              {preparationLoading ? (
                <p role="status" className="text-sm text-slate-400">
                  Loading preparation checklist...
                </p>
              ) : preparationSteps.length === 0 ? (
                <div className="rounded-xl border border-slate-800 p-4 text-sm text-slate-400">
                  <p>This patient has no preparation checklist steps.</p>
                  <button
                    type="button"
                    onClick={handleCreateChecklist}
                    disabled={creatingChecklist}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {creatingChecklist
                      ? "Creating..."
                      : "Create default checklist"}
                  </button>
                </div>
              ) : preparationSteps.map((step, index) => {
                const isCurrentStep =
                  !step.completed &&
                  index === preparationSteps.findIndex((item) => !item.completed)

                return (
                  <div
                    key={step.id}
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

                    <button
                      type="button"
                      onClick={() => handleTogglePreparationStep(step)}
                      disabled={Boolean(savingStepId)}
                      aria-pressed={step.completed}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                        step.completed
                          ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          : "border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      }`}
                    >
                      {savingStepId === step.id
                        ? "Saving..."
                        : step.completed
                          ? "Mark incomplete"
                          : "Mark complete"}
                    </button>

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
                  {formatProcedureDate(patient.date)} at{" "}
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
                  min="0"
                  max="120"
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
                  required
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
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                />

              </div>

              {/* TIME */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Procedure Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={editForm.time}
                  onChange={handleEditChange}
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
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default PatientDetails