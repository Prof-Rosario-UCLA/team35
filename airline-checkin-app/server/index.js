require("dotenv").config();
const express       = require("express");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");
const jwt           = require("jsonwebtoken");
const admin         = require("firebase-admin");

const app   = express();
const PORT  = 1919;

// basic middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

// Firebase
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
app.locals.db = db;

// JWT helpers
const SECRET     = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function requireAuth(req, res, next) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// SINGLE /api/login handler (keep ONE)
app.post("/api/login", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email required" });
  }

  // Look up user doc or create if missing
  let userDoc = await db.collection("users").where("email", "==", email).limit(1).get();
  let uid;
  if (userDoc.empty) {
    const ref = await db.collection("users").add({ name, email });
    uid = ref.id;
  } else {
    uid = userDoc.docs[0].id;
  }

  const token = jwt.sign({ uid, name }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token });
});



// Routers (protect only if needed)
const flightsRouter = require("./routes/flights");
const usersRouter   = require("./routes/users");
const checkinRouter = require("./routes/checkin");
const redisRouter = require("./routes/redis");

app.use("/flights", flightsRouter);          // public for now (no requireAuth)
app.use("/users",   usersRouter);
app.use("/checkin",  checkinRouter);
app.use("/redis", redisRouter);

app.get("/test", async (req, res) => {
  const snapshot = await db.collection("flights").get();
  const flights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(flights);
});

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
