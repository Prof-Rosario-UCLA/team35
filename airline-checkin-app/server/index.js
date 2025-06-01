const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Placeholder routes
app.post("/api/login", (req, res) => {
  // Auth logic + JWT
  res.json({ token: "fake-jwt-token" });
});

/* migrating to firebase
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
*/
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
app.locals.db = db;

const flightsRouter = require("./routes/flights");
const usersRouter = require("./routes/users");
const checkinRouter = require("./routes/checkin");

app.use("/flights", flightsRouter);
app.use("/users", usersRouter);
app.use("/checkin", checkinRouter);

app.get("/test", async (req, res) => {
  const snapshot = await db.collection("flights").get();
  const flights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(flights);
});

app.listen(1919, () => console.log("Server running on port 1919"));