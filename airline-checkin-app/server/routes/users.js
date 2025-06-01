const express = require("express");
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

module.exports = router;