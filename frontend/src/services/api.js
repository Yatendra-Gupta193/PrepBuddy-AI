const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getToken = () => localStorage.getItem("token");

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("prepbuddy-session-expired"));
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  const token = auth ? getToken() : null;

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to the backend at ${API_BASE_URL}. Check that the server is running.`
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiError(
        "The backend returned an invalid JSON response.",
        response.status
      );
    }
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message || `Request failed with status ${response.status}.`;

    if (response.status === 401 && token) {
      clearSession();
    }

    throw new ApiError(message, response.status);
  }

  return data;
}

const encodeId = (id) => encodeURIComponent(id);

export const api = {
  auth: {
    login: (credentials) =>
      request("/api/auth/login", {
        method: "POST",
        body: credentials,
        auth: false,
      }),
    register: (details) =>
      request("/api/auth/register", {
        method: "POST",
        body: details,
        auth: false,
      }),
    me: () => request("/api/auth/me"),
  },
  patients: {
    list: () => request("/api/patients"),
    get: (id) => request(`/api/patients/${encodeId(id)}`),
    create: (patient) =>
      request("/api/patients", { method: "POST", body: patient }),
    update: (id, patient) =>
      request(`/api/patients/${encodeId(id)}`, {
        method: "PUT",
        body: patient,
      }),
    delete: (id) =>
      request(`/api/patients/${encodeId(id)}`, { method: "DELETE" }),
  },
  appointments: {
    list: () => request("/api/appointments"),
    get: (id) => request(`/api/appointments/${encodeId(id)}`),
    create: (appointment) =>
      request("/api/appointments", {
        method: "POST",
        body: appointment,
      }),
    update: (id, appointment) =>
      request(`/api/appointments/${encodeId(id)}`, {
        method: "PUT",
        body: appointment,
      }),
    updateStatus: (id, status) =>
      request(`/api/appointments/${encodeId(id)}/status`, {
        method: "PATCH",
        body: { status },
      }),
    delete: (id) =>
      request(`/api/appointments/${encodeId(id)}`, {
        method: "DELETE",
      }),
  },
  preparations: {
    list: () => request("/api/preparations"),
    get: (patientId) =>
      request(`/api/preparations/${encodeId(patientId)}`),
    createChecklist: (patientId, steps) =>
      request(`/api/preparations/${encodeId(patientId)}/checklist`, {
        method: "POST",
        body: steps === undefined ? {} : { steps },
      }),
    updateStep: (patientId, stepId, completed) =>
      request(
        `/api/preparations/${encodeId(patientId)}/steps/${encodeId(stepId)}`,
        { method: "PATCH", body: { completed } }
      ),
    updateStatus: (patientId, status) =>
      request(`/api/preparations/${encodeId(patientId)}`, {
        method: "PATCH",
        body: { status },
      }),
  },
  reminders: {
    list: () => request("/api/reminders"),
    create: (reminder) =>
      request("/api/reminders", { method: "POST", body: reminder }),
    update: (id, reminder) =>
      request(`/api/reminders/${encodeId(id)}`, {
        method: "PATCH",
        body: reminder,
      }),
    delete: (id) =>
      request(`/api/reminders/${encodeId(id)}`, { method: "DELETE" }),
  },
};

export function notifyPatientsChanged() {
  window.dispatchEvent(new Event("prepbuddy-patients-updated"));
  window.dispatchEvent(new Event("prepbuddy-preparations-updated"));
  window.dispatchEvent(new Event("prepbuddy-appointments-updated"));
  window.dispatchEvent(new Event("prepbuddy-reminders-updated"));
}

export function notifyRemindersChanged() {
  window.dispatchEvent(new Event("prepbuddy-reminders-updated"));
}

export function notifyPreparationsChanged() {
  window.dispatchEvent(new Event("prepbuddy-preparations-updated"));
}

export function getPatientProgress(patient) {
  const steps = Array.isArray(patient?.preparationSteps)
    ? patient.preparationSteps
    : [];
  if (steps.length === 0) return 0;
  const completed = steps.filter((step) => step.completed).length;
  return Math.round((completed / steps.length) * 100);
}

export function getPatientStatus(patient) {
  const steps = Array.isArray(patient?.preparationSteps)
    ? patient.preparationSteps
    : [];
  if (steps.length === 0) return "Pending";
  const completed = steps.filter((step) => step.completed).length;
  if (completed === 0) return "Pending";
  if (completed === steps.length) return "Ready";
  return "In Progress";
}
