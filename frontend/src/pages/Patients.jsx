import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  api,
  getPatientProgress,
  getPatientStatus,
  notifyPatientsChanged,
} from "../services/api";
import usePatients from "../hooks/usePatients";
import useAuth from "../hooks/useAuth";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";
}

function formatDate(date) {
  if (!date) return "Not scheduled";

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00`)
    : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Patients() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { patients, loading, error, refresh } = usePatients(user?.id || user?._id);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletePatient, setDeletePatient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.success || ""
  );

  const normalizedPatients = useMemo(() => {
    return patients.map((patient) => ({
      ...patient,
      id: patient._id,
      progress: getPatientProgress(patient),
      status: getPatientStatus(patient),
    }));
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedPatients.filter((patient) => {
      const matchesSearch =
        !query ||
        String(patient.name || "").toLowerCase().includes(query) ||
        String(patient.id || "").toLowerCase().includes(query) ||
        String(patient.procedure || "").toLowerCase().includes(query) ||
        String(patient.status || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        patient.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [normalizedPatients, searchTerm, statusFilter]);

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

    return {
      total,
      ready,
      inProgress,
      averageProgress,
    };
  }, [normalizedPatients]);

  const handleDelete = async () => {
    if (!deletePatient || deleteLoading) return;
    setDeleteLoading(true);
    setActionError("");

    try {
      await api.patients.delete(deletePatient.id);
      setDeletePatient(null);
      setSuccessMessage("Patient deleted successfully.");
      notifyPatientsChanged();
      await refresh();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to delete this patient.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
              🛡
            </div>

            <div>
              <h1 className="text-xl font-bold">PrepBuddy</h1>
              <p className="text-xs text-slate-500">
                Clinic Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-950 text-sm font-semibold text-blue-400">
            {(user?.name || "Clinic Staff")
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("")}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{user?.name || "Clinic Staff"}</p>
              <p className="text-xs text-slate-500">
                {user?.email || user?.role || "Clinic account"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Title */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Patients</h2>
            <p className="mt-1 text-slate-400">
              Manage patient preparation and procedure readiness.
            </p>
          </div>

          <button
            onClick={() => navigate("/add-patient")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            + Add Patient
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5">
            <p className="text-sm text-slate-400">Total Patients</p>
            <p className="mt-2 text-3xl font-bold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5">
            <p className="text-sm text-slate-400">Ready</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {stats.ready}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5">
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {stats.inProgress}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5">
            <p className="text-sm text-slate-400">
              Average Preparation
            </p>
            <p className="mt-2 text-3xl font-bold">
              {stats.averageProgress}%
            </p>
          </div>
        </div>

        {/* Search + Filter */}
        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
            <button type="button" onClick={refresh} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}
        {actionError && (
          <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {actionError}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {successMessage}
          </p>
        )}

        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, patient ID, procedure or status..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-xl border border-slate-800 bg-[#0b1225] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-800 bg-[#0b1225] px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
          </select>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {loading ? (
            <div role="status" className="rounded-2xl border border-slate-800 bg-[#0b1225] px-6 py-14 text-center text-slate-400">
              Loading patients...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0b1225] px-6 py-14 text-center">
              <p className="text-lg font-semibold">
                {patients.length ? "No patients found" : "No patients yet"}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {patients.length
                  ? "Try changing your search or status filter."
                  : "Add a patient to start managing procedure preparation."}
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5 transition hover:border-slate-700"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Patient */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-lg font-bold text-blue-400">
                      {getInitials(patient.name)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold">
                          {patient.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            patient.status === "Ready"
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-blue-950 text-blue-400"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Patient ID: {patient.id}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        {patient.procedure || "Procedure not specified"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(patient.procedureDate)}
                        {patient.procedureTime
                          ? ` • ${patient.procedureTime}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="min-w-[220px] lg:w-64">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Preparation
                      </span>

                      <span className="text-sm font-semibold">
                        {patient.progress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${patient.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/patient/${patient.id}`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-400"
                    >
                      View
                    </Link>

                    <Link
                      to={`/patient/${patient.id}`}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-400"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => setDeletePatient(patient)}
                      className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
            <h3 className="text-xl font-bold">
              Delete Patient?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {deletePatient.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletePatient(null)}
                disabled={deleteLoading}
                className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
              >
                {deleteLoading ? "Deleting..." : "Delete Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}