import { useContext, useMemo } from "react";
import { AuthContext } from "../AuthContext";

const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:1919";

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

// import { useContext, useCallback } from "react";
// import { AuthContext } from "../AuthContext";

// // The BASE_URL is removed. All requests will be relative to the domain.
// // const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:1919";

// export function useApi() {
//   const { token, logout } = useContext(AuthContext);

//   // We use useCallback here as it's the idiomatic hook for memoizing functions.
//   const req = useCallback(async (url, opts = {}) => {
//     // Prepend /api to all requests. The browser will send this to your domain,
//     // and the GKE Ingress will route it to the backend service.
//     const res = await fetch(`${url}`, {
//       credentials: "include",
//       ...opts,
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         ...opts.headers,
//       },
//     });

//     if (res.status === 401) {
//       logout();
//       // Throw a standard error for consistent handling in consuming components
//       const error = new Error("Unauthorized");
//       error.status = 401;
//       throw error;
//     }

//     if (!res.ok) {
//       // Try to parse the error response as JSON, which is common
//       try {
//         const errorData = await res.json();
//         throw errorData;
//       } catch (e) {
//         // If the error response isn't JSON, throw a generic error
//         throw new Error(`Request failed with status ${res.status}`);
//       }
//     }
    
//     // Handle the case where there is no response body (e.g., HTTP 204)
//     if (res.status === 204) {
//       return null;
//     }
//     return res.json();

//   }, [token, logout]);

//   // The apiLogout function will now correctly call POST /api/logout
//   const apiLogout = () => req("/logout", { method: "POST" }).catch(() => {});

//   return { req, apiLogout };
// }