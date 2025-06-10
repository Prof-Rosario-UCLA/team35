const express = require("express");
const axios = require("axios");
const router = express.Router();

// POST /users
router.post("/", async (req, res) => {
    const db = req.app.locals.db;
    const { name, email } = req.body;
    try {
      const docRef = await db.collection("users").add({ name, email });
      res.json({ message: "User registered", id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
    }
});
  

// GET /users/:uid
router.get("/:uid", async (req, res) => {
  const db = req.app.locals.db;
  const userDoc = await db.collection("users").doc(req.params.uid).get();
  if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
  res.json({ id: userDoc.id, ...userDoc.data() });
});

// --- ADD THIS NEW ROUTE ---
// GET /users/:uid/checkins - Get all check-ins for a user with flight details
router.get("/:uid/checkins", async (req, res) => {
  const { uid } = req.params;
  const db = req.app.locals.db;

  try {
    const checkinsSnapshot = await db.collection("users").doc(uid).collection("checkins").get();
    
    // The documents now contain all the info we need, no extra lookups!
    const bookedFlights = checkinsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json(bookedFlights);
  } catch (error) {
    console.error("Failed to fetch user checkins:", error);
    res.status(500).json({ error: "Failed to fetch user checkins" });
  }
});

// GET /users/:uid/checkins - now with Redis caching
// router.get("/:uid/checkins", async (req, res) => {
//   const { uid } = req.params;
//   const db = req.app.locals.db;
//   const cacheKey = `checkins_${uid}`; // Dynamic key per user

//   try {
//     // 1. Check Redis cache
//     const redisResponse = await axios.get(`${REDIS_SERVICE_URL}/get/${cacheKey}`);
//     if (redisResponse.data && redisResponse.data.value) {
//       console.log(`Cache HIT for ${cacheKey}`);
//       return res.json(JSON.parse(redisResponse.data.value));
//     }
//   } catch (error) {
//     if (error.response?.status !== 404) {
//       console.error("Redis error:", error.message);
//     }
//   }

//   // 2. If cache miss, get from Firestore
//   console.log(`Cache MISS for ${cacheKey}. Fetching from Firestore.`);
//   try {
//     const checkinsSnapshot = await db.collection("users").doc(uid).collection("checkins").get();
//     const bookedFlights = checkinsSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // 3. Store in Redis
//     await axios.post(`${REDIS_SERVICE_URL}/set`, {
//       key: cacheKey,
//       value: JSON.stringify(bookedFlights),
//       ttl: CACHE_TTL_SECONDS,
//     });

//     res.json(bookedFlights);
//   } catch (dbError) {
//     console.error("Failed to fetch user checkins:", dbError);
//     res.status(500).json({ error: "Failed to fetch user checkins" });
//   }
// });

module.exports = router;