import { useMemo, useState } from "react"
import {
  Bell,
  CheckCircle2,
  Clock3,
  Search,
  Filter,
  CalendarDays,
  Mail,
  MessageSquare,
  MoreHorizontal,
  CircleAlert,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const initialReminders = [
  {
    id: 1,
    patientId: "PB-1031",
    patient: "Rohan Verma",
    procedure: "Endoscopy",
    type: "Preparation Reminder",
    message: "Please review your preparation instructions before the procedure.",
    scheduled: "Sep 8, 2026",
    time: "10:00 AM",
    channel: "Email",
    status: "Scheduled",
    priority: "High",
  },
  {
    id: 2,
    patientId: "PB-1032",
    patient: "Satyam",
    procedure: "Colonoscopy",
    type: "Confirmation Reminder",
    message: "Please confirm your appointment and preparation status.",
    scheduled: "Sep 9, 2026",
    time: "09:00 AM",
    channel: "Email",
    status: "Scheduled",
    priority: "Medium",
  },
  {
    id: 3,
    patientId: "PB-1033",
    patient: "Ronak Gupta",
    procedure: "MRI",
    type: "Procedure Reminder",
    message: "Your procedure is scheduled soon. Please be ready as instructed.",
    scheduled: "Aug 25, 2026",
    time: "06:00 PM",
    channel: "Email",
    status: "Sent",
    priority: "Low",
  },
  {
    id: 4,
    patientId: "PB-1030",
    patient: "Rohan Verma",
    procedure: "Endoscopy",
    type: "Preparation Follow-up",
    message: "Patient preparation is currently at 20%. Follow-up required.",
    scheduled: "Today",
    time: "02:00 PM",
    channel: "Notification",
    status: "Pending",
    priority: "High",
  },
]

function Reminders() {
  const navigate = useNavigate()

  const [reminders, setReminders] = useState(initialReminders)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [typeFilter, setTypeFilter] = useState("All Types")

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        reminder.patient.toLowerCase().includes(searchText) ||
        reminder.patientId.toLowerCase().includes(searchText) ||
        reminder.procedure.toLowerCase().includes(searchText) ||
        reminder.type.toLowerCase().includes(searchText)

      const matchesStatus =
        statusFilter === "All Status" ||
        reminder.status === statusFilter

      const matchesType =
        typeFilter === "All Types" ||
        reminder.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [reminders, search, statusFilter, typeFilter])

  const stats = {
    total: reminders.length,
    scheduled: reminders.filter((item) => item.status === "Scheduled").length,
    sent: reminders.filter((item) => item.status === "Sent").length,
    pending: reminders.filter((item) => item.status === "Pending").length,
  }

  const markAsSent = (id) => {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? { ...reminder, status: "Sent" }
          : reminder
      )
    )
  }

  const deleteReminder = (id) => {
    setReminders((current) =>
      current.filter((reminder) => reminder.id !== id)
    )
  }

  const openPatient = (patientId) => {
    navigate(`/patient/${patientId}`)
  }

  const getStatusClass = (status) => {
    if (status === "Sent") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    }

    if (status === "Pending") {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    }

    return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
  }

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "text-red-400"
    }

    if (priority === "Medium") {
      return "text-amber-400"
    }

    return "text-emerald-400"
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold">Reminders</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage patient preparation reminders
            </p>
          </div>

          <button
            onClick={() => navigate("/clinic-dashboard")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Reminders</p>
                <h2 className="mt-3 text-3xl font-bold">{stats.total}</h2>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Bell size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Scheduled</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.scheduled}
                </h2>
              </div>

              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                <Clock3 size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sent</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.sent}
                </h2>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.pending}
                </h2>
              </div>

              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <CircleAlert size={24} />
              </div>
            </div>
          </div>

        </div>

        {/* Search + Filters */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0b1124] p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, procedure or reminder..."
                className="w-full rounded-xl border border-slate-700 bg-[#020617] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Filter size={18} />
              <span className="text-sm">Filters</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>All Status</option>
              <option>Scheduled</option>
              <option>Sent</option>
              <option>Pending</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>All Types</option>
              <option>Preparation Reminder</option>
              <option>Confirmation Reminder</option>
              <option>Procedure Reminder</option>
              <option>Preparation Follow-up</option>
            </select>

          </div>
        </div>

        {/* Reminder List */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1124]">

          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">
              Patient Reminders
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredReminders.length} reminders found
            </p>
          </div>

          <div className="divide-y divide-slate-800">

            {filteredReminders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Bell
                  size={42}
                  className="mx-auto text-slate-600"
                />

                <h3 className="mt-4 text-lg font-semibold">
                  No reminders found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              filteredReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-6 transition hover:bg-slate-900/40"
                >

                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                    {/* Patient */}
                    <div className="flex min-w-[250px] items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 font-semibold text-blue-400">
                        {reminder.patient
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <button
                          onClick={() => openPatient(reminder.patientId)}
                          className="font-semibold text-white transition hover:text-blue-400"
                        >
                          {reminder.patient}
                        </button>

                        <p className="mt-1 text-xs text-slate-500">
                          Patient ID: {reminder.patientId}
                        </p>

                        <p className="mt-2 text-sm text-blue-400">
                          {reminder.procedure}
                        </p>
                      </div>

                    </div>

                    {/* Reminder Details */}
                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="font-medium text-white">
                          {reminder.type}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusClass(
                            reminder.status
                          )}`}
                        >
                          {reminder.status}
                        </span>

                        <span
                          className={`text-xs font-medium ${getPriorityClass(
                            reminder.priority
                          )}`}
                        >
                          {reminder.priority} Priority
                        </span>

                      </div>

                      <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        {reminder.message}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-500">

                        <span className="flex items-center gap-2">
                          <CalendarDays size={15} />
                          {reminder.scheduled}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock3 size={15} />
                          {reminder.time}
                        </span>

                        <span className="flex items-center gap-2">
                          {reminder.channel === "Email" ? (
                            <Mail size={15} />
                          ) : (
                            <Bell size={15} />
                          )}
                          {reminder.channel}
                        </span>

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">

                      {reminder.status !== "Sent" && (
                        <button
                          onClick={() => markAsSent(reminder.id)}
                          className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm text-emerald-400 transition hover:bg-emerald-500/10"
                        >
                          Mark Sent
                        </button>
                      )}

                      <button
                        onClick={() => openPatient(reminder.patientId)}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                      >
                        View Patient
                      </button>

                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                        title="Delete reminder"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                    </div>

                  </div>

                </div>
              ))
            )}

          </div>
        </div>

        {/* Bottom Information */}
        <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <MessageSquare size={22} />
            </div>

            <div>
              <h3 className="font-semibold">
                Reminder Management
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Reminders are currently managed in the frontend.
                Backend scheduling, email delivery and automated
                notifications will be connected in the next phase.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  )
}

export default Reminders