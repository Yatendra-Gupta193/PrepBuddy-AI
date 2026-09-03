import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  BellRing,
  Search,
  CheckCircle2,
  Clock3,
  LogOut,
  ChevronRight,
  Bot,
  Settings,
} from "lucide-react";

const STORAGE_KEY = "prepbuddy_patients";

/* =========================================================
   PATIENT DATA
========================================================= */

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

/* =========================================================
   PROGRESS
========================================================= */

function getProgress(patient) {
  const progress = Number(patient?.progress);

  if (Number.isFinite(progress)) {
    return Math.max(0, Math.min(100, progress));
  }

  return 0;
}

/* =========================================================
   STATUS
========================================================= */

function getStatus(patient) {
  const progress = getProgress(patient);

  if (progress >= 100) {
    return "Ready";
  }

  return "In Progress";
}

/* =========================================================
   INITIALS
========================================================= */

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

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {
  if (!date) {
    return "Not scheduled";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function ClinicDashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* =======================================================
     LOAD PATIENTS
  ======================================================= */

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  /* =======================================================
     LISTEN FOR PATIENT UPDATES
  ======================================================= */

  useEffect(() => {
    const refreshPatients = () => {
      setPatients(getPatients());
    };

    window.addEventListener(
      "prepbuddy-patients-updated",
      refreshPatients
    );

    window.addEventListener("storage", refreshPatients);

    return () => {
      window.removeEventListener(
        "prepbuddy-patients-updated",
        refreshPatients
      );

      window.removeEventListener("storage", refreshPatients);
    };
  }, []);

  /* =======================================================
     NORMALIZE PATIENT DATA
  ======================================================= */

  const normalizedPatients = useMemo(() => {
    return patients.map((patient) => ({
      ...patient,
      progress: getProgress(patient),
      status: getStatus(patient),
    }));
  }, [patients]);

  /* =======================================================
     DASHBOARD STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const total = normalizedPatients.length;

    const ready = normalizedPatients.filter(
      (patient) => patient.status === "Ready"
    ).length;

    const inProgress = normalizedPatients.filter(
      (patient) => patient.status === "In Progress"
    ).length;

    const averageProgress =
      total === 0
        ? 0
        : Math.round(
            normalizedPatients.reduce(
              (sum, patient) => sum + patient.progress,
              0
            ) / total
          );

    const atRisk = normalizedPatients.filter(
      (patient) =>
        patient.progress > 0 && patient.progress < 50
    ).length;

    return {
      total,
      ready,
      inProgress,
      averageProgress,
      atRisk,
    };
  }, [normalizedPatients]);

  /* =======================================================
     SEARCH PATIENTS
  ======================================================= */

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return normalizedPatients;
    }

    return normalizedPatients.filter((patient) => {
      return (
        String(patient.name || "")
          .toLowerCase()
          .includes(query) ||
        String(patient.id || "")
          .toLowerCase()
          .includes(query) ||
        String(patient.procedure || "")
          .toLowerCase()
          .includes(query) ||
        String(patient.status || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [normalizedPatients, searchTerm]);

  /* =======================================================
     SHOW LATEST PATIENTS
  ======================================================= */

  const dashboardPatients = filteredPatients.slice(0, 8);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">

          {/* Logo */}

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

          {/* Header Right */}

          <div className="flex items-center gap-4">

            {/* Notification */}

            <button
              onClick={() => navigate("/alerts")}
              className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Alerts"
            >
              <BellRing size={19} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-800 sm:block" />

            {/* Clinic Staff */}

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

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">

        <nav className="flex-1 space-y-1 p-4">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Main Menu
          </p>

          {/* Dashboard */}

          <button
            onClick={() => navigate("/clinic-dashboard")}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-600/10 px-3 py-3 text-sm font-medium text-blue-400"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          {/* Patients */}

          <Link
            to="/patients"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <Users size={19} />
            Patients
          </Link>

          {/* Procedures */}

          <button
            onClick={() => navigate("/procedures")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <CalendarDays size={19} />
            Procedures
          </button>

          {/* Protocols */}

          <button
            onClick={() => navigate("/protocols")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <ClipboardList size={19} />
            Protocols
          </button>

          {/* Reminders */}

          <button
            onClick={() => navigate("/reminders")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <BellRing size={19} />
            Reminders
          </button>

          {/* Alerts */}

          <button
            onClick={() => navigate("/alerts")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <BellRing size={20} />
            <span>Alerts</span>
          </button>

          {/* AI Assistant */}

          <button
            onClick={() => navigate("/ai-assistant")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <Bot size={20} />
            <span>AI Assistant</span>
          </button>

          <div className="my-4 border-t border-slate-800" />

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Account
          </p>

          {/* Settings */}

          <button
            onClick={() => navigate("/settings")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <Settings size={19} />
            Settings
          </button>
        </nav>

        {/* Logout */}

        <div className="border-t border-slate-800 p-4">
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </Link>
        </div>
      </aside>

      {/* =====================================================
          MAIN
          FIXED: sidebar spacing
      ===================================================== */}

      <main className="min-h-screen pt-16 lg:ml-64">

        {/* FIXED: full available width */}

        <div className="w-full p-6 lg:p-8">

          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="mb-8">

            <p className="mb-1 text-sm text-blue-400">
              Monday, August 24, 2026
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              Good morning, Clinic Staff
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Here's an overview of patient preparation.
            </p>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total Patients */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Total Patients
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stats.total}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Users size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-500">
                Patients in PrepBuddy
              </p>
            </div>

            {/* Ready */}

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
                Preparation completed
              </p>
            </div>

            {/* In Progress */}

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
                  <Clock3 size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-blue-400">
                Patients still preparing
              </p>
            </div>

            {/* Average */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Average Preparation
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {stats.averageProgress}%
                  </p>
                </div>

                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  <ClipboardList size={21} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-500">
                Across all patients
              </p>
            </div>

          </div>

          {/* =================================================
              PATIENT PREPARATION STATUS
          ================================================= */}

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60">

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">

              <div>
                <h3 className="font-semibold">
                  Patient Preparation Status
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Live patient data from PrepBuddy.
                </p>
              </div>

              <div className="flex items-center gap-3">

                {/* Search */}

                <div className="relative">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    placeholder="Search patient..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    className="w-56 rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />

                </div>

                <Link
                  to="/patients"
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500"
                >
                  View All
                </Link>

              </div>
            </div>

            {/* Table */}

            <div className="overflow-x-auto">

              {dashboardPatients.length === 0 ? (

                <div className="p-10 text-center">

                  <p className="font-semibold">
                    No patients found
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Try another patient name or ID.
                  </p>

                </div>

              ) : (

                <table className="w-full min-w-[800px]">

                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs text-slate-500">

                      <th className="px-5 py-4 font-medium">
                        Patient
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Procedure
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Date & Time
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Preparation
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {dashboardPatients.map((patient) => (

                      <tr
                        key={patient.id}
                        className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                      >

                        {/* Patient */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400">
                              {getInitials(patient.name)}
                            </div>

                            <div>

                              <p className="text-sm font-medium">
                                {patient.name}
                              </p>

                              <p className="text-xs text-slate-600">
                                ID: {patient.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Procedure */}

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {patient.procedure || "Not specified"}
                        </td>

                        {/* Date */}

                        <td className="px-5 py-4">

                          <p className="text-sm text-slate-300">
                            {formatDate(patient.procedureDate)}
                          </p>

                          <p className="text-xs text-slate-600">
                            {patient.procedureTime || ""}
                          </p>

                        </td>

                        {/* Progress */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{
                                  width: `${patient.progress}%`,
                                }}
                              />

                            </div>

                            <span className="text-xs text-slate-400">
                              {patient.progress}%
                            </span>

                          </div>

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          {patient.status === "Ready" ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">

                              <CheckCircle2 size={13} />

                              Ready

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">

                              <Clock3 size={13} />

                              In Progress

                            </span>

                          )}

                        </td>

                        {/* Action */}

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              navigate(`/patient/${patient.id}`)
                            }
                            className="text-slate-500 transition hover:text-blue-400"
                            title="View patient"
                          >
                            <ChevronRight size={18} />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              )}

            </div>
          </div>

          {/* =================================================
              BOTTOM SECTION
          ================================================= */}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* Preparation Overview */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <div className="mb-5">

                <h3 className="font-semibold">
                  Preparation Overview
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Current patient preparation summary.
                </p>

              </div>

              <div className="space-y-4">

                {/* Ready */}

                <div>

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-400">
                      Ready
                    </span>

                    <span className="text-emerald-400">
                      {stats.ready}
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          stats.total
                            ? (stats.ready / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    />

                  </div>
                </div>

                {/* In Progress */}

                <div>

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-400">
                      In Progress
                    </span>

                    <span className="text-blue-400">
                      {stats.inProgress}
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          stats.total
                            ? (stats.inProgress / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    />

                  </div>
                </div>

                {/* Average Progress */}

                <div>

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-400">
                      Average Progress
                    </span>

                    <span className="text-purple-400">
                      {stats.averageProgress}%
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${stats.averageProgress}%`,
                      }}
                    />

                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

              <h3 className="font-semibold">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Manage patients quickly.
              </p>

              <div className="mt-5 space-y-3">

                {/* Manage Patients */}

                <Link
                  to="/patients"
                  className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-4 transition hover:border-blue-500 hover:bg-slate-800/40"
                >

                  <div className="flex items-center gap-3">

                    <Users
                      size={19}
                      className="text-blue-400"
                    />

                    <span className="text-sm">
                      Manage Patients
                    </span>

                  </div>

                  <ChevronRight size={18} />

                </Link>

                {/* Add New Patient */}

                <Link
                  to="/add-patient"
                  className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-4 transition hover:border-blue-500 hover:bg-slate-800/40"
                >

                  <div className="flex items-center gap-3">

                    <Users
                      size={19}
                      className="text-emerald-400"
                    />

                    <span className="text-sm">
                      Add New Patient
                    </span>

                  </div>

                  <ChevronRight size={18} />

                </Link>

                {/* Check Ready Patients */}

                <button
                  onClick={() => {
                    const readyPatients =
                      normalizedPatients.filter(
                        (patient) =>
                          patient.status === "Ready"
                      );

                    alert(
                      `${readyPatients.length} patient(s) are ready for procedure.`
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800 px-4 py-4 text-left transition hover:border-blue-500 hover:bg-slate-800/40"
                >

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      size={19}
                      className="text-emerald-400"
                    />

                    <span className="text-sm">
                      Check Ready Patients
                    </span>

                  </div>

                  <ChevronRight size={18} />

                </button>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default ClinicDashboard; 