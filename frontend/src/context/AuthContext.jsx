import { useEffect, useState } from "react";
import AuthContext from "./authContext";
import { api, clearSession, getToken } from "../services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState("");

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!getToken()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const response = await api.auth.me();
        if (active) setUser(normalizeUser(response.user));
      } catch (error) {
        if (error.status === 401 || error.status === 404) {
          clearSession();
        }
        if (active) {
          setRestoreError(error.message || "Unable to restore your session.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    const handleExpiredSession = () => {
      setUser(null);
      setRestoreError("Your session has expired. Please sign in again.");
    };

    window.addEventListener(
      "prepbuddy-session-expired",
      handleExpiredSession
    );

    return () => {
      active = false;
      window.removeEventListener(
        "prepbuddy-session-expired",
        handleExpiredSession
      );
    };
  }, []);

  const authenticate = (response) => {
    if (!response.token || !response.user) {
      throw new Error("The server response did not include authentication details.");
    }

    localStorage.setItem("token", response.token);
    const authenticatedUser = normalizeUser(response.user);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setRestoreError("");
    setLoading(false);
    return response;
  };

  const login = async (email, password) =>
    authenticate(await api.auth.login({ email, password }));

  const register = async ({ name, email, password }) =>
    authenticate(
      await api.auth.register({
        name,
        email,
        password,
        role: "clinic_staff",
      })
    );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, restoreError, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function normalizeUser(user) {
  return { ...user, id: user.id || user._id };
}
