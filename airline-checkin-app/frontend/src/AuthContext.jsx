import React, {createContext, useState, useEffect} from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({children}) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || null);

  useEffect(() => {
    if (token) localStorage.setItem("jwt", token);
    else localStorage.removeItem("jwt");
  }, [token]);

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{token, setToken, logout}}>
      {children}
    </AuthContext.Provider>
  );
}
