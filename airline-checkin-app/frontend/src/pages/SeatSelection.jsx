import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";
import { AuthContext } from "../AuthContext";
import { encodeSeat } from "../utils/wasm"; 
import { encodeSeatSync } from "../utils/wasm";

export default function SeatSelection() {
  const { flightId } = useParams();
  const { req } = useApi();
  const { token } = useContext(AuthContext);
  const [showEncoded, setShowEncoded] = useState(false);  


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

  /* --- load seat list, With Reddis --- */
  useEffect(() => {
  console.log('Loading seats for flight:');
  // Helper to fetch from DB and update cache
  const fetchFromDBAndUpdateCache = async () => {
  try {
    console.log('Fetching seats from DB for flight:');
    let dbData = await req(`/flights/${flightId}/seats`);
    setSeats(dbData);
    for (let i = 0; i < dbData.length; i++) {
      // Ensure each seat has an id property
      dbData[i].class_ = dbData[i].class
      if (!dbData[i].id) {
        dbData[i].id = `${dbData[i].row}${dbData[i].column}`; // e.g., '1A'
      }
      // Ensure each seat has an available property
      if (typeof dbData[i].available === 'undefined') {
        dbData[i].available = true; // Default to available if not set
      }
    }
    console.log("Updating Redis cache with new fresh DB data...", dbData);
    // Now update Redis cache
    await req(`/redis/init`, {
      method: "POST",
      body: JSON.stringify({
        flightId: flightId,
        allSeats: dbData,  // depends on your dbData format!
      }),
    });
    
    console.log('Updated Redis cache with fresh DB data');
  } catch (dbErr) {
    console.error('DB fetch failed:', dbErr);
    setSeats([]);
  }
  };
  // Main flow: first try Redis, then fallback to DB if needed
  req(`/redis/free/${flightId}`)
    .then(cachedData => {
        // Cache hit → use cached data
        console.log('Cache hit? ', cachedData);
        if (!Array.isArray(cachedData) ||  cachedData.length === 0) {
          console.log('No seats found in cache, fetching from DB');
          fetchFromDBAndUpdateCache();
        } else {
          console.log('Cache hit actually found:', cachedData);
          setSeats(cachedData);
        }
    })
    .catch(cacheErr => {
      if (cacheErr.error === "Flight not found") {
        console.log('Flight not found in cache, fetching from DB:', cacheErr);
              fetchFromDBAndUpdateCache();
      }
      else {
        console.error('Cache fetch failed completely:', cacheErr);
      }
      // On error, fallback to DB
    });

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [flightId]);


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
      //fetchFromDBAndUpdateCache();
      // update local state to reflect the change immediately
      setSeats((prev) =>
        prev.map((s) =>
          s.id === seatId
            ? { ...s, available: false, userId: uid }     /* 🔹 ensure available === false */
            : s
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
        <button
          className="btn"                                   /* 🔹 NEW */
          onClick={() => setShowEncoded((v) => !v)}         /* 🔹 NEW */
          style={{ marginBottom: "1rem" }}                  /* 🔹 NEW */
        >
          {showEncoded ? "Show Seat IDs" : "Show WASM Codes"}  
        </button>   

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
              {showEncoded
                ? encodeSeatSync(
                  parseInt(seat.id.match(/\d+/)?.[0] || 0),  // Extracts row number from "10C"
                  seat.id.slice(-1)                          // Takes last char: "C"
                ) ?? seat.id
                : seat.id}
 {/* Use seat.id */}
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