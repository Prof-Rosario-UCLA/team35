import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export const AuthContext = createContext({
  token: null,
  setToken: () => {},
  logout: () => {},
});

export default function AuthProvider({ children }) {
  
  const [token, setToken] = useState(null); // cookie does persistence

  const logout = useCallback(() => setToken(null), []);

  const value = useMemo(() => ({ token, setToken, logout }), [token, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
