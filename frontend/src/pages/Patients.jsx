import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "prepbuddy_patients";

const DEFAULT_PATIENTS = [
  {
    id: "PB-1032",
    name: "Satyam",
    age: 45,
    phone: "+91 73028-68848",
    email: "satyam@gmail.com",
    procedure: "Colonoscopy",
    procedureDate: "2026-02-05",
    procedureTime: "21:00",
    progress: 100,
    status: "Ready",
  },
];

function getPatients() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PATIENTS));
      return DEFAULT_PATIENTS;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : DEFAULT_PATIENTS;
  } catch (error) {
    console.error("Unable to load patients:", error);
    return DEFAULT_PATIENTS;
  }
}

function getProgress(patient) {
  const progress = Number(patient?.progress);

  if (Number.isFinite(progress)) {
    return Math.max(0, Math.min(100, progress));
  }

  return 0;
}

function getStatus(patient) {
  const progress = getProgress(patient);

  if (progress >= 100) return "Ready";

  if (patient?.status === "Completed") {
    return "Ready";
  }

  return "In Progress";
}

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

export default function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletePatient, setDeletePatient] = useState(null);

  // Load patients when page opens
  useEffect(() => {
    setPatients(getPatients());
  }, []);

  // Keep Patients page synchronized when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setPatients(getPatients());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const normalizedPatients = useMemo(() => {
    return patients.map((patient) => ({
      ...patient,
      progress: getProgress(patient),
      status: getStatus(patient),
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

  const savePatients = (updatedPatients) => {
    setPatients(updatedPatients);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedPatients)
    );

    // Notify other components in the same tab
    window.dispatchEvent(new Event("prepbuddy-patients-updated"));
  };

  const handleDelete = () => {
    if (!deletePatient) return;

    const updatedPatients = patients.filter(
      (patient) => patient.id !== deletePatient.id
    );

    savePatients(updatedPatients);
    setDeletePatient(null);
  };

  // Refresh when another PrepBuddy component updates patient data
  useEffect(() => {
    const handlePatientUpdate = () => {
      setPatients(getPatients());
    };

    window.addEventListener(
      "prepbuddy-patients-updated",
      handlePatientUpdate
    );

    return () => {
      window.removeEventListener(
        "prepbuddy-patients-updated",
        handlePatientUpdate
      );
    };
  }, []);

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
              CS
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">Clinic Staff</p>
              <p className="text-xs text-slate-500">
                City Care Clinic
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
            onClick={() => navigate("/patients/add")}
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
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
          </select>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0b1225] px-6 py-14 text-center">
              <p className="text-lg font-semibold">
                No patients found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or status filter.
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
                className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
              >
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}