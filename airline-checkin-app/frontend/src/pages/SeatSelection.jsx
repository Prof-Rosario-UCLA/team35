import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";
import { AuthContext } from "../AuthContext";

export default function SeatSelection() {
  const { flightId }  = useParams();
  const { req }       = useApi();
  const { token }     = useContext(AuthContext);
  const uid           = token ? JSON.parse(atob(token.split(".")[1])).uid : "";

  const [seats,     setSeats]     = useState([]);   // full seat objects
  const [selected,  setSelected]  = useState(null);
  const [dragging,  setDragging]  = useState(false);

  /* --- load seat list --- */
  useEffect(() => {
    req(`/flights/${flightId}/seats`)
      .then(setSeats)
      .catch(console.error);
  }, [flightId]);

  /* --- helpers --- */
  const occupied = seats.filter((s) => !s.available).map((s) => s.seatNumber);

  const onDragStart = () => setDragging(true);
  const onDragEnd   = () => setDragging(false);
  const allowDrop   = (e) => e.preventDefault();

  const onDropSeat  = (seatId) => async (e) => {
    e.preventDefault();
    try {
      await req(`/flights/${flightId}/seats/reserve`, {
        method: "POST",
        body: JSON.stringify({ uid, seatNumber: seatId }),
      });
      setSelected(seatId);
      // update local state
      setSeats((prev) =>
        prev.map((s) =>
          s.seatNumber === seatId ? { ...s, available: false, userId: uid } : s
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
        <h2 style={{ fontSize:"1.5rem", fontWeight:700, margin:"1.5rem 0" }}>
          Drag passenger → seat — flight {flightId}
        </h2>

        {/* passenger token */}
        <section aria-label="Passenger" style={{ textAlign:"center" }}>
          <div
            className={`passenger ${dragging ? "dragging" : ""}`}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            aria-grabbed={dragging}
          >🧍</div>
          <p style={{ marginTop:".5rem" }}>Passenger</p>
        </section>

        {/* seat grid */}
        <section className="seat-grid" aria-label="Seat map">
          {seats.map((seat) => (
            <div
              key={seat.seatNumber}
              className={`seat ${!seat.available ? "occupied" : ""} ${
                selected === seat.seatNumber ? "selected" : ""
              }`}
              onDragOver={allowDrop}
              onDrop={seat.available ? onDropSeat(seat.seatNumber) : undefined}
              aria-disabled={!seat.available}
            >
              {seat.seatNumber}
            </div>
          ))}
        </section>

        {selected && (
          <p style={{ marginTop:"1.5rem", textAlign:"center" }}>
            Selected seat: <strong>{selected}</strong>
          </p>
        )}
      </main>
    </>
  );
}
