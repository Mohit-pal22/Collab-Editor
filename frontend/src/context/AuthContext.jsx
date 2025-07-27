import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { doLogin, doLogout, isLoggedIn, getToken } from "../auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      const token = getToken();
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } catch (e) {
        console.error("Invalid token");
        doLogout();
      }
    }
    setAuthLoading(false);
  }, []);

  const login = (token) => {
    doLogin(token);
    const decoded = jwtDecode(token);
    setUser(decoded.user);
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
