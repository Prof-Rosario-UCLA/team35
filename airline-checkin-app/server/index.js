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

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/api/flights", async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: { seats: true },
    });
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not retrieve flights" });
  }
});

app.listen(1919, () => console.log("Server running on port 1919"));