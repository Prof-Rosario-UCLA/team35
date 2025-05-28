/* export async function fetchFlights() {
  const res = await fetch("http://localhost:1919/api/flights", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch flights");
  return res.json();
} */

import { useContext } from "react";
import { AuthContext } from "../AuthContext";

/** Hook that returns a fetch wrapper with JWT attached */
export function useApi() {
  const { token } = useContext(AuthContext);

  const req = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    }).then((r) => (r.ok ? r.json() : Promise.reject(r)));

  return { req };
}
