import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";

const rows = 10;
const columns = ["A", "B", "C", "D", "E", "F"];

export default function SeatSelection() {
  const { flightId } = useParams();
  const { req } = useApi();

  const [occupied, setOccupied] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);

  /* --- load occupied seats from backend --- */
  useEffect(() => {
    req(`/api/seats?flight=${flightId}`)
      .then((data) => setOccupied(data)) // data = ["2C","5A",...]
      .catch(() => setOccupied([]));
  }, [flightId]);

  /* --- drag handlers --- */
  const onDragStart = (e) => {
    e.dataTransfer.setData("text/plain", "passenger1");
    setDragging(true);
  };
  const onDragEnd = () => setDragging(false);

  const onDropSeat = (seatId) => (e) => {
    e.preventDefault();
    setSelected(seatId);
    setDragging(false);
    // TODO: POST /api/seats to reserve seat
  };
  const allowDrop = (e) => e.preventDefault();

  const renderSeat = (row, col) => {
    const seatId = `${row}${col}`;
    const isOccupied = occupied.includes(seatId);
    const isSelected = selected === seatId;
    return (
      <div
        key={seatId}
        className={`seat ${isOccupied ? "occupied" : ""} ${
          isSelected ? "selected" : ""
        }`}
        onDragOver={allowDrop}
        onDrop={!isOccupied ? onDropSeat(seatId) : undefined}
        aria-disabled={isOccupied}
      >
        {seatId}
      </div>
    );
  };

  return (
    <>
      <NavBar />
      <main className="container">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1.5rem 0" }}>
          Drag passenger → seat — flight {flightId}
        </h2>

        {/* passenger token */}
        <section aria-label="Passenger" style={{ textAlign: "center" }}>
          <div
            className={`passenger ${dragging ? "dragging" : ""}`}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            aria-grabbed={dragging}
          >
            🧍
          </div>
          <p style={{ marginTop: ".5rem" }}>Passenger 1</p>
        </section>

        {/* seat grid */}
        <section className="seat-grid" aria-label="Seat map">
          {Array.from({ length: rows }, (_, i) =>
            columns.map((col) => renderSeat(i + 1, col))
          )}
        </section>

        {selected && (
          <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
            Selected seat: <strong>{selected}</strong>
          </p>
        )}
      </main>
    </>
  );
}
