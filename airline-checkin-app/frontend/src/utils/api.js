import { useContext, useMemo } from "react";
import { AuthContext } from "../AuthContext";

const BASE_URL = "" || "http://localhost:1919";

export function useApi() {
  const { token, logout } = useContext(AuthContext);

  const req = useMemo(() => {
    return async (url, opts = {}) => {
      const res = await fetch(`${BASE_URL}${url}`, {
        credentials: "include",
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...opts.headers,
        },
      });

      if (res.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw await res.json();
      return res.status === 204 ? null : res.json();
    };
  }, [token, logout]);

  const apiLogout = () => req("/api/logout", { method: "POST" }).catch(() => {});

 return { req, apiLogout };
}