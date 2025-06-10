/* export async function fetchFlights() {
  const res = await fetch("http://localhost:1919/api/flights", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch flights");
  return res.json();
} */

import { useContext } from "react";
import { AuthContext } from "../AuthContext";

const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:1919";

export function useApi() {
  const { token, logout } = useContext(AuthContext);

  const req = async (url, opts = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      credentials: "include",
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),  // 👈 add back
        ...opts.headers,
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error("Unauthorised");
    }
    if (!res.ok) throw await res.json();
    return res.status === 204 ? null : res.json();
  };
  return { req };
}