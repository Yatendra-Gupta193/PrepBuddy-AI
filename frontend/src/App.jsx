
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import useAuth from "./hooks/useAuth";
import Landing from "./pages/landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClinicDashboard from "./pages/ClinicDashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import AddPatient from "./pages/AddPatient";
import Procedures from "./pages/Procedures";
import Protocols from "./pages/Protocols";
import Reminders from "./pages/Reminders";
import Alerts from "./pages/Alerts";
import AIAssistant from "./pages/AIAssistant";

function ProtectedRoute({ children }) {
  const { user, loading, restoreError } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Restoring your session...
      </main>
    );
  }

  return user
    ? children
    : <Navigate to="/login" replace state={{ message: restoreError }} />;
}

function DashboardNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const hiddenPaths = ["/", "/login", "/register", "/clinic-dashboard"];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }
  if (
    location.pathname === "/procedures" ||
    location.pathname.startsWith("/patient/")
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Clinic navigation"
      className="flex items-center justify-end gap-4 border-b border-slate-800 bg-slate-950 px-6 py-3 text-sm"
    >
      <Link
        to="/clinic-dashboard"
        className="font-medium text-slate-300 transition hover:text-white"
      >
        Dashboard
      </Link>
      <span className="hidden text-slate-500 sm:inline">
        {user?.name || "Clinic Staff"}
      </span>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
        className="font-medium text-slate-400 transition hover:text-white"
      >
        Log out
      </button>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <DashboardNavigation />

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/clinic-dashboard"
          element={<ClinicDashboard />}
        />

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/patient/:id"
          element={<PatientDetails />}
        />

        <Route
          path="/add-patient"
          element={<AddPatient />}
        />

        <Route
          path="/procedures"
          element={<Procedures />}
        />

        <Route
          path="/protocols"
          element={<Protocols />}
        />

        <Route
          path="/reminders"
          element={<Reminders />}
        />

        <Route path="/alerts" element={<Alerts />} />

        <Route
        path="/ai-assistant"
        element={<AIAssistant />}
        />

      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
