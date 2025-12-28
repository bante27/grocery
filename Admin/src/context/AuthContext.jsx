// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

/* ---------------- CONTEXT ---------------- */
const AuthContext = createContext();

/* ---------------- HOOK ---------------- */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

/* ---------------- PROVIDER ---------------- */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("guest");

  /* ---------------- AXIOS INSTANCE ---------------- */
  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  /* ---------------- AXIOS INTERCEPTOR ---------------- */
  api.interceptors.request.use(
    (config) => {
      const storedToken = localStorage.getItem("adminToken");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  /* ---------------- CHECK SESSION ---------------- */
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem("adminToken");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/user");

        if (res.data && res.data.role === "admin") {
          setUser(res.data);
          setToken(storedToken);
          setRole("admin");
          setIsAuthenticated(true);
        } else {
          logout(false);
        }
      } catch (err) {
        console.error("Session check failed");
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    // eslint-disable-next-line
  }, []);

  /* ---------------- LOGIN ---------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/admin/login", { email, password });

      if (!res.data.success) {
        return { success: false, error: "Login failed" };
      }

      const { token, user } = res.data;

      if (user.role !== "admin") {
        return {
          success: false,
          error: "Admin access only",
        };
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      setUser(user);
      setToken(token);
      setRole("admin");
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      let msg = "Login failed";

      if (err.response?.status === 401) msg = "Invalid credentials";
      if (err.response?.status === 403) msg = "Admin only";
      if (err.code === "ERR_NETWORK")
        msg = "Laravel server not running";

      return { success: false, error: msg };
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async (redirect = true) => {
    try {
      if (token) {
        await api.post("/logout");
      }
    } catch (e) {
      // ignore
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    setUser(null);
    setToken(null);
    setRole("guest");
    setIsAuthenticated(false);

    if (redirect) {
      window.location.href = "/login";
    }
  };

  /* ---------------- PROVIDER VALUE ---------------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isAuthenticated,
        login,
        logout,
        api,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
