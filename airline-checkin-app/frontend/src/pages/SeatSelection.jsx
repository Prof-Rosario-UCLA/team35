import { useParams } from "react-router-dom";
import { useState } from "react";
import NavBar from "../components/NavBar";

export default function SeatSelection() {
  const { flightId } = useParams();
  const [selected, setSelected] = useState(null);

  const seats = Array.from({ length: 30 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  return (
    <>
      <NavBar />
      <main className="container">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1.5rem 0" }}>
          Select a seat — flight {flightId}
        </h2>

        <div className="seat-grid">
          {seats.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`seat ${selected === s ? "selected" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>

        {selected && (
          <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
            You selected seat <strong>{selected}</strong>
          </p>
        )}
      </main>
    </>
  );
}
