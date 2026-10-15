import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        setUser({
          _id: decoded.id,
          role: decoded.role,
        });

      } catch (err) {
        Cookies.remove("token");
      }
    }

    setAuthLoading(false);
  }, []);

  const login = (userData, token) => {
    Cookies.set("token", token, {
      expires: 7,       // 7 days — matches JWT expiry
      secure: true,
      sameSite: "strict",
    });
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);