import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFlights } from "../utils/api";

export const Dashboard = () => {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlights()
      .then((data) => setFlights(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Your Flights</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {flights.map((flight) => (
          <li key={flight.id}>
            Flight {flight.code} to {flight.destination} —{" "}
            <button onClick={() => navigate(`/select-seat/${flight.id}`)}>
              Check in
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};