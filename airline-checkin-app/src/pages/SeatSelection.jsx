import React, { useState } from "react";
import { useParams } from "react-router-dom";

export const SeatSelection = () => {
  const { flightId } = useParams();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const seats = ["1A", "1B", "1C", "2A", "2B", "2C"];

  return (
    <div>
      <h1>Select a Seat for Flight {flightId}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {seats.map((seat) => (
          <button
            key={seat}
            onClick={() => setSelectedSeat(seat)}
            style={{
              padding: "1em",
              backgroundColor: selectedSeat === seat ? "green" : "lightgray",
            }}
          >
            {seat}
          </button>
        ))}
      </div>
      {selectedSeat && <p>You selected: {selectedSeat}</p>}
    </div>
  );
};