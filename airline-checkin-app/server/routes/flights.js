const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// GET /flights
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  const snapshot = await db.collection("flights").get();
  const flights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(flights);
});

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

// POST /flights/:fid/seats/reserve
// router.post("/:fid/seats/reserve", async (req, res) => {
//   const { uid, seatNumber } = req.body;
//   const db = req.app.locals.db;
//   const seatRef = db.collection("flights").doc(req.params.fid).collection("seats").doc(seatNumber);
//   const seatDoc = await seatRef.get();
//   if (!seatDoc.exists || !seatDoc.data().available) {
//     return res.status(400).json({ error: "Seat unavailable" });
//   }
//   await seatRef.update({ available: false, userId: uid });
  
//   const userCheckinRef = db.collection("users").doc(uid).collection("checkins").doc(flightId);
//   await userCheckinRef.set({
//     flightId,
//     seatNumber,
//     checkInTime: admin.firestore.FieldValue.serverTimestamp(),
//   });

//   res.json({ message: "Seat reserved and user checkins updated" });

// });

// POST /flights/:fid/seats/reserve
router.post("/:fid/seats/reserve", async (req, res) => {
  const { uid, seatNumber } = req.body;
  const db = req.app.locals.db;
  const flightId = req.params.fid;

  try {
    const seatRef = db.collection("flights").doc(flightId).collection("seats").doc(seatNumber);
    const seatDoc = await seatRef.get();

    if (!seatDoc.exists || !seatDoc.data().available) {
      return res.status(400).json({ error: "Seat unavailable" });
    }

    await seatRef.update({ available: false, userId: uid });
    
    const userCheckinRef = db.collection("users").doc(uid).collection("checkins").doc(flightId);
    await userCheckinRef.set({
      flightId,
      seatNumber,
      checkInTime: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Seat reserved and user check-in updated" });
  } catch (error) {
    // --- THIS IS THE CHANGE ---
    // Log the full error object to see the specific Firestore error
    console.error("FULL ERROR when reserving seat:", error); 
    // -------------------------
    
    res.status(500).json({ error: "Internal server error while reserving seat." });
  }
});

module.exports = router;
