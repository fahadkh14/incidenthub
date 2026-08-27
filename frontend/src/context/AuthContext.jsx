import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { authService } from "../services/authService";
import { extractErrorMessage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("incidenthub_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem("incidenthub_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.me();

      setUser(res.data.data.user);

      localStorage.setItem(
        "incidenthub_user",
        JSON.stringify(res.data.data.user)
      );
    } catch {
      localStorage.removeItem("incidenthub_token");
      localStorage.removeItem("incidenthub_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);

      const { user: u, access_token } = res.data.data;

      localStorage.setItem("incidenthub_token", access_token);
      localStorage.setItem("incidenthub_user", JSON.stringify(u));

      setUser(u);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: extractErrorMessage(err, "Invalid email or password"),
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await authService.register(
        name,
        email,
        password,
        role
      );

      const { user: u, access_token } = res.data.data;

      localStorage.setItem("incidenthub_token", access_token);
      localStorage.setItem("incidenthub_user", JSON.stringify(u));

      setUser(u);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: extractErrorMessage(err, "Could not create account"),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("incidenthub_token");
    localStorage.removeItem("incidenthub_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}