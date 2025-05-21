const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Placeholder routes
app.post("/api/login", (req, res) => {
  // Auth logic + JWT
  res.json({ token: "fake-jwt-token" });
});

app.get("/api/flights", (req, res) => {
  res.json([
    { id: "AB123", destination: "New York", checkedIn: false },
    { id: "CD456", destination: "Los Angeles", checkedIn: true },
  ]);
});

app.listen(1919, () => console.log("Server running on port 1919"));