import React from "react";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const mockFlights = [
    { id: "ABC123", destination: "New York", status: "Checked In" },
    { id: "XYZ456", destination: "Los Angeles", status: "Not Checked In" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Your Flights</h1>
      <ul>
        {mockFlights.map((flight) => (
          <li key={flight.id} className="my-2">
            <div>
              Flight to {flight.destination} - {flight.status}
            </div>
            {flight.status !== "Checked In" && (
              <button
                onClick={() => navigate(`/select-seat/${flight.id}`)}
                className="bg-blue-500 text-white px-4 py-2 mt-2"
              >
                Check In & Select Seat
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
