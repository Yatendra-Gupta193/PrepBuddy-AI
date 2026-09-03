import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Search,
  Clock3,
  CheckCircle2,
  Users,
  ChevronRight,
  Filter,
  ClipboardList,
  ShieldCheck,
  BellRing,
  LogOut,
  LayoutDashboard,
  UserRound,
  Settings,
  X,
} from "lucide-react";

const STORAGE_KEY = "prepbuddy_patients";

/* =========================
   PATIENT STORAGE
========================= */

function getPatients() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to load patients:", error);
    return [];
  }
}

function savePatients(patients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));

  // Notify other PrepBuddy pages
  window.dispatchEvent(
    new Event("prepbuddy-patients-updated")
  );
}

/* =========================
   HELPERS
========================= */

function getProgress(patient) {
  const progress = Number(patient?.progress);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progress));
}

function getStatus(patient) {
  const progress = getProgress(patient);

  if (progress >= 100) {
    return "Ready";
  }

  return "In Progress";
}

function formatDate(date) {
  if (!date) {
    return "Not scheduled";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

/* =========================
   MAIN COMPONENT
========================= */

function Procedures() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [procedureFilter, setProcedureFilter] = useState("All");

  /* =========================
     SCHEDULING STATE
  ========================= */

  const [schedulePatient, setSchedulePatient] = useState(null);

  const [scheduleDate, setScheduleDate] = useState("");

  const [scheduleTime, setScheduleTime] = useState("");

  const [scheduleError, setScheduleError] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  /* =========================
     LOAD PATIENTS
  ========================= */

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  /* =========================
     REFRESH PATIENT DATA
  ========================= */

  useEffect(() => {
    const refreshPatients = () => {
      setPatients(getPatients());
    };

    window.addEventListener(
      "prepbuddy-patients-updated",
      refreshPatients
    );

    window.addEventListener(
      "storage",
      refreshPatients
    );

    return () => {
      window.removeEventListener(
        "prepbuddy-patients-updated",
        refreshPatients
      );

      window.removeEventListener(
        "storage",
        refreshPatients
      );
    };
  }, []);

  /* =========================
     NORMALIZE PROCEDURES
  ========================= */

  const procedures = useMemo(() => {
    return patients.map((patient) => ({
      ...patient,

      progress: getProgress(patient),

      status: getStatus(patient),

      procedure:
        patient.procedure || "Not specified",
    }));
  }, [patients]);

  /* =========================
     PROCEDURE TYPES
  ========================= */

  const procedureTypes = useMemo(() => {
    const unique = [
      ...new Set(
        procedures
          .map((patient) => patient.procedure)
          .filter(Boolean)
      ),
    ];

    return unique;
  }, [procedures]);

  /* =========================
     STATISTICS
  ========================= */

  const stats = useMemo(() => {
    const total = procedures.length;

    const ready = procedures.filter(
      (patient) =>
        patient.status === "Ready"
    ).length;

    const inProgress = procedures.filter(
      (patient) =>
        patient.status === "In Progress"
    ).length;

    const scheduled = procedures.filter(
      (patient) =>
        patient.procedureDate
    ).length;

    return {
      total,
      ready,
      inProgress,
      scheduled,
    };
  }, [procedures]);

  /* =========================
     SEARCH + FILTERS
  ========================= */

  const filteredProcedures = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return procedures.filter((patient) => {
      const matchesSearch =
        !query ||
        String(patient.name || "")
          .toLowerCase()
          .includes(query) ||
        String(patient.id || "")
          .toLowerCase()
          .includes(query) ||
        String(patient.procedure || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        patient.status === statusFilter;

      const matchesProcedure =
        procedureFilter === "All" ||
        patient.procedure === procedureFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProcedure
      );
    });
  }, [
    procedures,
    searchTerm,
    statusFilter,
    procedureFilter,
  ]);

  /* =========================
     OPEN SCHEDULE MODAL
  ========================= */

  function openScheduleModal(patient) {
    setSchedulePatient(patient);

    setScheduleDate(
      patient.procedureDate || ""
    );

    setScheduleTime(
      patient.procedureTime || ""
    );

    setScheduleError("");
  }

  /* =========================
     CLOSE SCHEDULE MODAL
  ========================= */

  function closeScheduleModal() {
    if (isSaving) {
      return;
    }

    setSchedulePatient(null);

    setScheduleDate("");

    setScheduleTime("");

    setScheduleError("");
  }

  /* =========================
     SAVE PROCEDURE SCHEDULE
  ========================= */

  function handleScheduleSubmit(event) {
    event.preventDefault();

    if (!schedulePatient) {
      return;
    }

    if (!scheduleDate) {
      setScheduleError(
        "Please select a procedure date."
      );

      return;
    }

    if (!scheduleTime) {
      setScheduleError(
        "Please select a procedure time."
      );

      return;
    }

    setIsSaving(true);

    try {
      const currentPatients =
        getPatients();

      const updatedPatients =
        currentPatients.map((patient) => {
          if (
            patient.id !==
            schedulePatient.id
          ) {
            return patient;
          }

          return {
            ...patient,

            procedureDate:
              scheduleDate,

            procedureTime:
              scheduleTime,
          };
        });

      savePatients(updatedPatients);

      setPatients(updatedPatients);

      setSchedulePatient(null);

      setScheduleDate("");

      setScheduleTime("");

      setScheduleError("");
    } catch (error) {
      console.error(
        "Unable to schedule procedure:",
        error
      );

      setScheduleError(
        "Unable to save the schedule. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

        <div className="flex h-16 items-center justify-between px-6">

          <Link
            to="/"
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

          <div className="flex items-center gap-4">

            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">

              <BellRing size={19} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />

            </button>

            <div className="hidden h-8 w-px bg-slate-800 sm:block" />

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

        </div>

      </header>

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">

        <nav className="flex-1 space-y-1 p-4">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Main Menu
          </p>

          <Link
            to="/clinic-dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/patients"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <Users size={19} />
            Patients
          </Link>

          <Link
            to="/procedures"
            className="flex items-center gap-3 rounded-xl bg-blue-600/10 px-3 py-3 text-sm font-medium text-blue-400"
          >
            <CalendarDays size={19} />
            Procedures
          </Link>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white">
            <ClipboardList size={19} />
            Protocols
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white">
            <BellRing size={19} />
            Reminders
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white">
            <Clock3 size={19} />
            Alerts
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white">
            <UserRound size={19} />
            AI Assistant
          </button>

          <div className="my-4 border-t border-slate-800" />

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Account
          </p>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white">
            <Settings size={19} />
            Settings
          </button>

        </nav>

        <div className="border-t border-slate-800 p-4">

          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </Link>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="pt-16 lg:pl-64">

        <div className="mx-auto max-w-7xl p-6 lg:p-8">

          {/* PAGE HEADING */}

          <div className="mb-8">

            <p className="mb-1 text-sm text-blue-400">
              Clinic Management
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              Procedures
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage patient procedures and preparation status.
            </p>

          </div>

          {/* ================= STATS ================= */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Procedures
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stats.total}
                  </p>

                </div>

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <CalendarDays size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-500">
                Patient procedures
              </p>

            </div>

            {/* SCHEDULED */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Scheduled
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stats.scheduled}
                  </p>

                </div>

                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  <Clock3 size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-500">
                Date assigned
              </p>

            </div>

            {/* IN PROGRESS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    In Progress
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stats.inProgress}
                  </p>

                </div>

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <ClipboardList size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-blue-400">
                Preparation ongoing
              </p>

            </div>

            {/* READY */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Ready
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stats.ready}
                  </p>

                </div>

                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                  <CheckCircle2 size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-emerald-400">
                Ready for procedure
              </p>

            </div>

          </div>

          {/* ================= FILTERS ================= */}

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* SEARCH */}

              <div className="relative w-full lg:w-80">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  placeholder="Search patient or procedure..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

              </div>

              {/* FILTERS */}

              <div className="flex flex-wrap items-center gap-3">

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Filter size={16} />
                  Filters
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Ready">
                    Ready
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                </select>

                <select
                  value={procedureFilter}
                  onChange={(event) =>
                    setProcedureFilter(event.target.value)
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                >

                  <option value="All">
                    All Procedures
                  </option>

                  {procedureTypes.map(
                    (procedure) => (
                      <option
                        key={procedure}
                        value={procedure}
                      >
                        {procedure}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </div>

          {/* ================= PROCEDURE LIST ================= */}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60">

            <div className="border-b border-slate-800 p-5">

              <h3 className="font-semibold">
                Patient Procedures
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {filteredProcedures.length} procedure
                {filteredProcedures.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            {filteredProcedures.length === 0 ? (

              <div className="p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                  <CalendarDays size={25} />
                </div>

                <h3 className="mt-4 font-semibold">
                  No procedures found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-800">

                {filteredProcedures.map(
                  (patient) => (

                    <div
                      key={patient.id}
                      className="flex flex-col gap-5 p-5 transition hover:bg-slate-800/30 lg:flex-row lg:items-center"
                    >

                      {/* PATIENT */}

                      <div className="flex min-w-[220px] flex-1 items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-semibold text-blue-400">
                          {getInitials(
                            patient.name
                          )}
                        </div>

                        <div>

                          <h4 className="font-semibold">
                            {patient.name}
                          </h4>

                          <p className="mt-1 text-xs text-slate-600">
                            Patient ID:{" "}
                            {patient.id}
                          </p>

                        </div>

                      </div>

                      {/* PROCEDURE */}

                      <div className="min-w-[160px] flex-1">

                        <p className="text-xs text-slate-600">
                          Procedure
                        </p>

                        <p className="mt-1 font-medium text-slate-300">
                          {patient.procedure}
                        </p>

                      </div>

                      {/* DATE */}

                      <div className="min-w-[170px] flex-1">

                        <p className="text-xs text-slate-600">
                          Scheduled Date
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {formatDate(
                            patient.procedureDate
                          )}
                        </p>

                        {patient.procedureTime && (
                          <p className="mt-1 text-xs text-slate-600">
                            {patient.procedureTime}
                          </p>
                        )}

                      </div>

                      {/* PREPARATION */}

                      <div className="min-w-[180px] flex-1">

                        <div className="flex items-center justify-between">

                          <p className="text-xs text-slate-600">
                            Preparation
                          </p>

                          <p className="text-xs font-medium text-slate-400">
                            {patient.progress}%
                          </p>

                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${patient.progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="min-w-[120px]">

                        {patient.status ===
                        "Ready" ? (

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">

                            <CheckCircle2
                              size={14}
                            />

                            Ready

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">

                            <Clock3
                              size={14}
                            />

                            In Progress

                          </span>

                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="flex items-center gap-2">

                        {/* SCHEDULE */}

                        <button
                          onClick={() =>
                            openScheduleModal(
                              patient
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-3 text-sm text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                          title={
                            patient.procedureDate
                              ? "Edit Schedule"
                              : "Schedule Procedure"
                          }
                        >

                          <CalendarDays
                            size={17}
                          />

                          <span className="hidden xl:inline">
                            {patient.procedureDate
                              ? "Edit"
                              : "Schedule"}
                          </span>

                        </button>

                        {/* VIEW PATIENT */}

                        <button
                          onClick={() =>
                            navigate(
                              `/patient/${patient.id}`
                            )
                          }
                          className="flex items-center justify-center rounded-xl border border-slate-800 p-3 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
                          title="View Patient"
                        >

                          <ChevronRight
                            size={18}
                          />

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* ================= INFO ================= */}

          <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

            <div className="flex gap-4">

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <ClipboardList size={21} />
              </div>

              <div>

                <h3 className="font-semibold">
                  Procedure Management
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Procedures are connected to
                  patient records. You can now
                  schedule or update a procedure
                  date and time. Protocol management
                  and automated reminders will be
                  connected in the next modules.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ================= SCHEDULE MODAL ================= */}

      {schedulePatient && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-800 p-6">

              <div>

                <p className="text-sm text-blue-400">
                  Procedure Scheduling
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {schedulePatient.procedure}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {schedulePatient.name} ·{" "}
                  {schedulePatient.id}
                </p>

              </div>

              <button
                type="button"
                onClick={closeScheduleModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close"
              >

                <X size={20} />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleScheduleSubmit
              }
            >

              <div className="space-y-5 p-6">

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Procedure Date
                  </label>

                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(event) => {
                      setScheduleDate(
                        event.target.value
                      );

                      setScheduleError("");
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                </div>

                {/* TIME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Procedure Time
                  </label>

                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(event) => {
                      setScheduleTime(
                        event.target.value
                      );

                      setScheduleError("");
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                </div>

                {/* ERROR */}

                {scheduleError && (

                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {scheduleError}
                  </p>

                )}

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-800 p-6">

                <button
                  type="button"
                  onClick={
                    closeScheduleModal
                  }
                  disabled={isSaving}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Schedule"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Procedures;