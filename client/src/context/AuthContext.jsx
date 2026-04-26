import { createContext, useContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("pulse_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        connectSocket(parsed._id);
      } catch {
        localStorage.removeItem("pulse_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("pulse_user", JSON.stringify(userData));
    setUser(userData);
    connectSocket(userData._id);
  };

  const logout = () => {
    localStorage.removeItem("pulse_user");
    disconnectSocket();
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("pulse_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
