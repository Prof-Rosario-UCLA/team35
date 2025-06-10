import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";

// const MOCK_FLIGHTS = [
//   { id: 42, code: "UA 204", destination: "JFK", time: "10 : 45 AM" },
//   { id: 43, code: "AA 123", destination: "LAX", time: "2 : 30 PM" },
//   { id: 44, code: "DL 456", destination: "ORD", time: "5 : 15 PM" },
// ];

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { req } = useApi();

  useEffect(() => {
    req("/flights")
      .then(setFlights)
      .catch((e) =>
        setError(e.error || "Failed to load flights. Please try again.")
    );
  }, []);

    

  return (
    <>
      <NavBar />
      <main className="container">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1.5rem 0" }}>
          Your upcoming flights
        </h2>

        {flights.length === 0 ? (
          <p>No flights found.</p>
        ) : (
          <ul style={{ display: "grid", gap: "1rem" }}>
            {flights.map((f) => (
              <li key={f.id} className="card">
                <div>
                  <p style={{ fontWeight: 600 }}>{f.code}</p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    To {f.destination} • {f.time}
                  </p>
                </div>
                <button
                  className="btn"
                  onClick={() => navigate(`/select-seat/${f.id}`)}
                >
                  Check in
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
