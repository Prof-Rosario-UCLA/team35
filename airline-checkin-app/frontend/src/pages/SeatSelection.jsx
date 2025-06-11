import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";
import { AuthContext } from "../AuthContext";

export default function SeatSelection() {
  const { flightId } = useParams();
  const { req } = useApi();
  const { token } = useContext(AuthContext);

  let uid = "";
  if (token) {
    try {
      uid = JSON.parse(atob(token.split(".")[1])).uid;
    } catch (e) {
      console.error("Failed to parse JWT:", e);
    }
  }

  const [seats, setSeats] = useState([]); // Will hold full seat objects [{id: '1A', ...}]
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);

  /* --- load seat list --- */
  useEffect(() => {
  req(`/flights/${flightId}/seats`)
    .then(setSeats)
    .catch(err => { console.error(err); setSeats([]); });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [flightId]);   // req is stable now; omit to avoid extra fetch

  /* --- helpers --- */
  const onDragStart = () => setDragging(true);
  const onDragEnd = () => setDragging(false);
  const allowDrop = (e) => e.preventDefault();

  const onDropSeat = (seatId) => async (e) => {
    e.preventDefault();
    if (!seatId) {
      alert("Invalid seat selected.");
      return;
    }
    try {
      await req(`/flights/${flightId}/seats/reserve`, {
        method: "POST",
        body: JSON.stringify({ uid, seatNumber: seatId }),
      });
      setSelected(seatId);
      // update local state to reflect the change immediately
      setSeats((prev) =>
        prev.map((s) =>
          s.id === seatId ? { ...s, available: false, userId: uid } : s
        )
      );
    } catch (err) {
      alert(err.error || "Seat reservation failed");
    }
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
          <p style={{ marginTop: ".5rem" }}>Passenger</p>
        </section>

        {/* seat grid */}
        <section className="seat-grid" aria-label="Seat map">
          {seats.map((seat) => (
            <div
              key={seat.id}  // Use seat.id
              className={`seat ${!seat.available ? "occupied" : ""} ${
                selected === seat.id ? "selected" : "" // Use seat.id
              }`}
              onDragOver={allowDrop}
              onDrop={seat.available ? onDropSeat(seat.id) : undefined} // Use seat.id
              aria-disabled={!seat.available}
            >
              {seat.id} {/* Use seat.id */}
            </div>
          ))}
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