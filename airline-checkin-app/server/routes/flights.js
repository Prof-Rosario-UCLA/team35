const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");
const REDIS_SERVICE_URL = process.env.redis_service || "http://redis-service:5000";
const CACHE_TTL_SECONDS = 300; // 5 minutes

// GET /flights
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  const snapshot = await db.collection("flights").get();
  const flights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(flights);
});


// GET /flights - now with Redis caching
// router.get("/", async (req, res) => {
//   const cacheKey = "all_flights";

//   try {
//     // 1. Check Redis cache first
//     const redisResponse = await axios.get(`${REDIS_SERVICE_URL}/get/${cacheKey}`);
//     if (redisResponse.data && redisResponse.data.value) {
//       console.log("Cache HIT for all_flights");
//       return res.json(JSON.parse(redisResponse.data.value));
//     }
//   } catch (error) {
//     // A 404 from the redis-service means a cache miss, which is normal.
//     // We only log other unexpected errors.
//     if (error.response?.status !== 404) {
//       console.error("Redis error:", error.message);
//     }
//   }

//   // 2. If cache miss, get from Firestore
//   console.log("Cache MISS for all_flights. Fetching from Firestore.");
//   try {
//     const db = req.app.locals.db;
//     const snapshot = await db.collection("flights").get();
//     const flights = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//     // 3. Store the result in Redis for next time
//     await axios.post(`${REDIS_SERVICE_URL}/set`, {
//       key: cacheKey,
//       value: JSON.stringify(flights),
//       ttl: CACHE_TTL_SECONDS,
//     });

//     res.json(flights);
//   } catch (dbError) {
//     res.status(500).json({ error: "Failed to fetch flights from Firestore" });
//   }
// });

// GET /flights/:fid
router.get("/:fid", async (req, res) => {
  const db = req.app.locals.db;
  const doc = await db.collection("flights").doc(req.params.fid).get();
  if (!doc.exists) return res.status(404).json({ error: "Flight not found" });
  res.json({ id: doc.id, ...doc.data() });
});

// GET /flights/:fid/seats
router.get("/:fid/seats", async (req, res) => {
  const db = req.app.locals.db;
  const seatsSnapshot = await db.collection("flights").doc(req.params.fid).collection("seats").get();
  const seats = seatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(seats);
});
// Helper to remove undefined values
function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

router.post("/admin/upload", async (req, res) => {
  console.log("Upload req.headers['content-type']:", req.headers['content-type']);
  const db = req.app.locals.db;
  try {
    const manifestData = req.body;  // Now getting JSON directly!

    if (!Array.isArray(manifestData)) {
      throw new Error("Manifest data must be an array of flights");
    }

    const batch = db.batch();

    manifestData.forEach(flight => {
      const flightRef = db.collection("flights").doc(String(flight.id));

      // Prepare flight data:
      const flightData = {
        date: flight.date ? admin.firestore.Timestamp.fromDate(new Date(flight.date)) : null,
        origin: flight.origin,
        destination: flight.destination,
        status: flight.status || "on-time" // Default to "on-time" if missing
      };

      batch.set(flightRef, removeUndefined(flightData));

      // Create seats under seats subcollection
      flight.seats?.forEach(seat => {
        const seatRef = flightRef.collection("seats").doc(String(seat.id));

        batch.set(seatRef, {
          id: seat.id,
          class: seat.class,
          available: true,   // Initial state
          userId: null       // Initial state
        });
      });
    });

    await batch.commit();
    res.json({ message: "Manifest uploaded successfully", flights: manifestData.length });
  } catch (error) {
    console.error("Error uploading manifest:", error);
    res.status(500).json({ error: "Failed to upload manifest" });
  }
});


// POST /flights/:fid/seats/reserve
router.post("/:fid/seats/reserve", async (req, res) => {
  const { uid, seatNumber } = req.body;
  const db = req.app.locals.db;
  const flightId = req.params.fid;

  try {
    const flightRef = db.collection("flights").doc(flightId);
    const seatRef = flightRef.collection("seats").doc(seatNumber);
    
    const [flightDoc, seatDoc] = await Promise.all([flightRef.get(), seatRef.get()]);

    if (!flightDoc.exists) {
      return res.status(404).json({ error: "Flight not found" });
    }
    if (!seatDoc.exists || !seatDoc.data().available) {
      return res.status(400).json({ error: "Seat unavailable" });
    }

    // Get flight data to denormalize
    const flightData = flightDoc.data();

    // Reserve the seat
    await seatRef.update({ available: false, userId: uid });
    
    // Create a check-in document for the user with flight details included
    const userCheckinRef = db.collection("users").doc(uid).collection("checkins").doc(flightId);
    const checkinData = {
      flightId,
      seatNumber,
      checkInTime: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (flightData.origin)        checkinData.origin        = flightData.origin;
    if (flightData.destination)   checkinData.destination   = flightData.destination;
    if (flightData.departureTime) checkinData.departureTime = flightData.departureTime;

    await userCheckinRef.set(checkinData);
        res.json({ message: "Seat reserved and user check-in updated" });
    } catch (error) {
      console.error("FULL ERROR when reserving seat:", error); 
      res.status(500).json({ error: "Internal server error while reserving seat." });
    }
});

module.exports = router;
