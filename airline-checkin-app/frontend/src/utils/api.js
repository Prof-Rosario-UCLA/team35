/* export async function fetchFlights() {
  const res = await fetch("http://localhost:1919/api/flights", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch flights");
  return res.json();
} */

import { useContext } from "react";
import { AuthContext } from "../AuthContext";

export function useApi() {
  const { token, logout } = useContext(AuthContext);

  const req = async (url, opts = {}) => {
    const res = await fetch(url, {
      credentials: "include",                   // send / receive cookies
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
    });

    if (res.status === 401) {                  // token expired or missing
      logout();
      throw new Error("Unauthorised");
    }
    if (!res.ok) throw await res.json();       // bubble up backend error JSON
    return res.status === 204 ? null : res.json();
  };

  return { req };
}