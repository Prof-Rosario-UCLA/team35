export async function fetchFlights() {
  const res = await fetch("http://localhost:1919/api/flights", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch flights");
  return res.json();
}