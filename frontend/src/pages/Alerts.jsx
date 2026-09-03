import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Filter,
  Bell,
  UserRound,
  CalendarDays,
  XCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const initialAlerts = [
  {
    id: 1,
    patientId: "PB-1031",
    patient: "Rohan Verma",
    procedure: "Endoscopy",
    title: "Preparation Progress Low",
    message: "Patient preparation is currently at 20%. Follow-up may be required.",
    date: "Today",
    time: "10:30 AM",
    severity: "High",
    status: "Active",
  },
  {
    id: 2,
    patientId: "PB-1032",
    patient: "Satyam",
    procedure: "Colonoscopy",
    title: "Preparation In Progress",
    message: "Patient preparation is at 80%. Final readiness check is pending.",
    date: "Today",
    time: "11:00 AM",
    severity: "Medium",
    status: "Active",
  },
  {
    id: 3,
    patientId: "PB-1033",
    patient: "Ronak Gupta",
    procedure: "MRI",
    title: "Patient Ready",
    message: "All preparation checkpoints have been completed.",
    date: "Today",
    time: "09:30 AM",
    severity: "Low",
    status: "Resolved",
  },
  {
    id: 4,
    patientId: "PB-1030",
    patient: "Rohan Verma",
    procedure: "Endoscopy",
    title: "Procedure Reminder Pending",
    message: "A scheduled reminder has not yet been completed.",
    date: "Today",
    time: "02:00 PM",
    severity: "High",
    status: "Active",
  },
]

function Alerts() {
  const navigate = useNavigate()

  const [alerts, setAlerts] = useState(initialAlerts)
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("All Severity")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const query = search.toLowerCase()

      const matchesSearch =
        alert.patient.toLowerCase().includes(query) ||
        alert.patientId.toLowerCase().includes(query) ||
        alert.procedure.toLowerCase().includes(query) ||
        alert.title.toLowerCase().includes(query)

      const matchesSeverity =
        severityFilter === "All Severity" ||
        alert.severity === severityFilter

      const matchesStatus =
        statusFilter === "All Status" ||
        alert.status === statusFilter

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [alerts, search, severityFilter, statusFilter])

  const stats = {
    total: alerts.length,
    active: alerts.filter((alert) => alert.status === "Active").length,
    high: alerts.filter(
      (alert) =>
        alert.severity === "High" && alert.status === "Active"
    ).length,
    resolved: alerts.filter(
      (alert) => alert.status === "Resolved"
    ).length,
  }

  const resolveAlert = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? { ...alert, status: "Resolved" }
          : alert
      )
    )
  }

  const removeAlert = (id) => {
    setAlerts((current) =>
      current.filter((alert) => alert.id !== id)
    )
  }

  const getSeverityClass = (severity) => {
    if (severity === "High") {
      return "bg-red-500/10 text-red-400 border border-red-500/20"
    }

    if (severity === "Medium") {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    }

    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
  }

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    }

    return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
  }

  const getAlertIcon = (severity) => {
    if (severity === "High") {
      return <AlertTriangle size={22} />
    }

    if (severity === "Medium") {
      return <Clock3 size={22} />
    }

    return <CheckCircle2 size={22} />
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="mt-1 text-sm text-slate-400">
              Monitor important patient preparation alerts
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

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total Alerts
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.total}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Bell size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Active
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.active}
                </h2>
              </div>

              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <Clock3 size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  High Priority
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.high}
                </h2>
              </div>

              <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1124] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Resolved
                </p>
                <h2 className="mt-3 text-3xl font-bold">
                  {stats.resolved}
                </h2>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle2 size={24} />
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
                placeholder="Search patient, procedure or alert..."
                className="w-full rounded-xl border border-slate-700 bg-[#020617] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Filter size={18} />
              <span className="text-sm">Filters</span>
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>All Severity</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Resolved</option>
            </select>

          </div>
        </div>

        {/* Alert List */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1124]">

          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">
              Patient Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredAlerts.length} alerts found
            </p>
          </div>

          <div className="divide-y divide-slate-800">

            {filteredAlerts.length === 0 ? (
              <div className="px-6 py-16 text-center">

                <CheckCircle2
                  size={42}
                  className="mx-auto text-emerald-500"
                />

                <h3 className="mt-4 text-lg font-semibold">
                  No alerts found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Everything looks good with the current filters.
                </p>

              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-6 transition hover:bg-slate-900/40"
                >

                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                    {/* Alert + Patient */}
                    <div className="flex min-w-[280px] items-start gap-4">

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          alert.severity === "High"
                            ? "bg-red-500/10 text-red-400"
                            : alert.severity === "Medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {getAlertIcon(alert.severity)}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {alert.title}
                        </h3>

                        <button
                          onClick={() =>
                            navigate(`/patient/${alert.patientId}`)
                          }
                          className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                          <UserRound size={15} />
                          {alert.patient}
                        </button>

                        <p className="mt-1 text-xs text-slate-500">
                          Patient ID: {alert.patientId}
                        </p>

                        <p className="mt-2 text-sm text-blue-400">
                          {alert.procedure}
                        </p>
                      </div>

                    </div>

                    {/* Details */}
                    <div className="flex-1">

                      <p className="max-w-2xl text-sm leading-6 text-slate-400">
                        {alert.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getSeverityClass(
                            alert.severity
                          )}`}
                        >
                          {alert.severity} Priority
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusClass(
                            alert.status
                          )}`}
                        >
                          {alert.status}
                        </span>

                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays size={14} />
                          {alert.date}
                        </span>

                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 size={14} />
                          {alert.time}
                        </span>

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">

                      {alert.status === "Active" && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="flex items-center gap-2 rounded-lg border border-emerald-500/30 px-4 py-2 text-sm text-emerald-400 transition hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 size={16} />
                          Resolve
                        </button>
                      )}

                      <button
                        onClick={() =>
                          navigate(`/patient/${alert.patientId}`)
                        }
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                      >
                        View Patient
                      </button>

                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                        title="Remove alert"
                      >
                        <XCircle size={18} />
                      </button>

                    </div>

                  </div>

                </div>
              ))
            )}

          </div>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h3 className="font-semibold">
                Alert Monitoring
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Alerts are currently managed in the frontend.
                Automatic alerts based on patient preparation,
                procedure schedules and backend events will be
                connected in the next integration phase.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  )
}

export default Alerts