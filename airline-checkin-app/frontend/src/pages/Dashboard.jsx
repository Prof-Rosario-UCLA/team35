import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../utils/api";
import { AuthContext } from "../AuthContext";
import NavBar from "../components/NavBar";

export default function Dashboard() {
  const { req } = useApi();
  const { token } = useContext(AuthContext);

  const [allFlights, setAllFlights] = useState([]);
  const [bookedFlights, setBookedFlights] = useState([]);
  const [error, setError] = useState("");

  // Get UID from token
  let uid = "";
  if (token) {
    try {
      uid = JSON.parse(atob(token.split(".")[1])).uid;
    } catch (e) {
      console.error("Failed to parse JWT:", e);
    }
  }

  // Fetch all flights
useEffect(() => {
  console.log("⏳ flights effect triggered");
  if (!token) return;

  const fetchFlights = () =>
    req("/flights")
      .then(setAllFlights)
      .catch(() => setError("Could not fetch flights."));

  fetchFlights();
  const id = setInterval(fetchFlights, 5 * 60_000);
  return () => clearInterval(id);
}, [token, req]);

// Fetch user's booked flights
useEffect(() => {
  console.log("⏳ checkins effect triggered");
  if (!token || !uid) return;

  const fetchCheckins = () =>
    req(`/users/${uid}/checkins`)
      .then(setBookedFlights)
      .catch(() => setError("Could not fetch your booked flights."));

  fetchCheckins();
  const id = setInterval(fetchCheckins, 5 * 60_000);
  return () => clearInterval(id);
}, [token, uid, req]);

  return (
    <>
      <NavBar />
      <main className="container">
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        {/* --- Section 1: User's Booked Flights --- */}
        <section>
          <h2>Your Booked Flights</h2>
          {bookedFlights.length > 0 ? (
            <ul style={{ display: "grid", gap: "1rem", listStyle: "none", padding: 0 }}>
              {bookedFlights.map((flight) => (
                <li key={`${flight.id}-${flight.seatNumber}`} className="card">
                  <div>
                    <p style={{ fontWeight: 600 }}>Flight {flight.id}</p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {flight.origin} to {flight.destination}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, textAlign: "right" }}>Seat</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>{flight.seatNumber}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have not checked in for any flights.</p>
          )}
        </section>

        {/* --- Section 2: All Available Flights --- */}
        <section style={{marginTop: "2rem"}}>
          <h2>All Available Flights</h2>
          {allFlights.length > 0 ? (
            <ul style={{ display: "grid", gap: "1rem", listStyle: "none", padding: 0 }}>
              {allFlights.map((flight) => (
                <li key={flight.id} className="card">
                   <div>
                    <p style={{ fontWeight: 600 }}>Flight {flight.id}</p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {flight.origin} to {flight.destination}
                    </p>
                  </div>
                  <Link to={`/select-seat/${flight.id}`} className="btn">
                    Check In
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No flights available at this time.</p>
          )}
        </section>
      </main>
    </>
  );
}