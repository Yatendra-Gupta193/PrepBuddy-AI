import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  Save,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api, notifyPatientsChanged } from "../services/api"
import useAuth from "../hooks/useAuth"
import { localDateTimeToISO } from "../services/dateTime"

function AddPatient() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    procedure: "",
    date: "",
    time: "",
    doctor: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [createdPatientId, setCreatedPatientId] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading || createdPatientId) return
    setError("")
    setLoading(true)

    const procedure =
      formData.procedure === "ct-scan"
        ? "CT Scan"
        : formData.procedure.charAt(0).toUpperCase() +
          formData.procedure.slice(1)

    try {
      const response = await api.patients.create({
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        procedure,
      })
      const patient = response.patient
      setCreatedPatientId(patient._id)
      notifyPatientsChanged()

      try {
        await api.appointments.create({
          patient: patient._id,
          appointmentDate: localDateTimeToISO(formData.date, formData.time),
          appointmentType: procedure,
          doctorName: formData.doctor.trim(),
        })
      } catch (appointmentError) {
        setError(
          `Patient was created, but the appointment could not be scheduled: ${appointmentError.message}`
        )
        return
      }

      navigate("/patients", {
        state: { success: "Patient and procedure appointment created successfully." },
      })
    } catch (requestError) {
      setError(requestError.message || "Unable to create this patient.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-xl">🛡️</span>
            </div>

            <div>
              <h1 className="text-xl font-bold">
                PrepBuddy
              </h1>

              <p className="text-xs text-slate-500">
                Clinic Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-950 text-sm font-semibold text-blue-400">
              {(user?.name || "Clinic Staff")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">
                {user?.name || "Clinic Staff"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email || user?.role || "Clinic account"}
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate("/patients")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
        >
          <ArrowLeft size={18} />
          Back to Patients
        </button>

        {/* Title */}
        <div className="mb-8">

          <p className="mb-2 text-sm font-medium text-blue-400">
            Patient Management
          </p>

          <h2 className="text-3xl font-bold">
            Add New Patient
          </h2>

          <p className="mt-2 text-slate-400">
            Register a new patient and add their procedure information.
          </p>

        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl sm:p-8">

          <form onSubmit={handleSubmit}>

            {/* Patient Information */}
            <div className="mb-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400">
                  <User size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Patient Information
                  </h3>

                  <p className="text-sm text-slate-500">
                    Enter basic patient details
                  </p>
                </div>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />

                  </div>
                </div>

                {/* Age */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    required
                    placeholder="Enter age"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />

                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Email */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="patient@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />

                  </div>

                </div>

                {/* Phone */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Phone Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Procedure Information */}
            <div className="border-t border-slate-800 pt-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400">
                  <Stethoscope size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Procedure Information
                  </h3>

                  <p className="text-sm text-slate-500">
                    Add upcoming procedure details
                  </p>
                </div>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Procedure */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Procedure
                  </label>

                  <select
                    name="procedure"
                    value={formData.procedure}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select procedure
                    </option>

                    <option value="colonoscopy">
                      Colonoscopy
                    </option>

                    <option value="endoscopy">
                      Endoscopy
                    </option>

                    <option value="ultrasound">
                      Ultrasound
                    </option>

                    <option value="mri">
                      MRI
                    </option>

                    <option value="ct-scan">
                      CT Scan
                    </option>

                  </select>

                </div>

                {/* Date */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Procedure Date
                  </label>

                  <div className="relative">

                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none focus:border-blue-500"
                    />

                  </div>

                </div>

                {/* Time */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Procedure Time
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                </div>

                {/* Doctor */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Assigned Doctor
                  </label>

                  <input
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    placeholder="Enter doctor name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />

                </div>

              </div>

            </div>

            {/* Buttons */}
            {error && (
              <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </p>
            )}
            {createdPatientId && (
              <Link
                to={`/patient/${createdPatientId}`}
                className="mb-5 inline-flex rounded-lg text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Open the patient record
              </Link>
            )}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/patients")}
                className="rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                <Save size={18} />
                {loading ? "Saving..." : createdPatientId ? "Patient Created" : "Add Patient"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  )
}

export default AddPatient