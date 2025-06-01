const express = require("express");
const router = express.Router();

// POST /checkin
router.post("/", async (req, res) => {
  const { uid, flightId, seatNumber } = req.body;
  const db = req.app.locals.db;
  const checkinRef = db.collection("checkins").doc(`${uid}_${flightId}`);
  await checkinRef.set({ uid, flightId, seatNumber, checkedIn: true });

  // Update seat status
  const seatRef = db.collection("flights").doc(flightId).collection("seats").doc(seatNumber);
  await seatRef.update({ checkedIn: true });

  res.json({ message: "Checked in" });
});

// GET /checkin/:uid/:fid
router.get("/:uid/:fid", async (req, res) => {
  const db = req.app.locals.db;
  const checkinDoc = await db.collection("checkins").doc(`${req.params.uid}_${req.params.fid}`).get();
  if (!checkinDoc.exists) return res.status(404).json({ error: "Check-in not found" });
  res.json(checkinDoc.data());
});

module.exports = router;