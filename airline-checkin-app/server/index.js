require("dotenv").config();
const express       = require("express");
const cors          = require("cors");
const cookieParser  = require("cookie-parser");
const jwt           = require("jsonwebtoken");
const admin         = require("firebase-admin");

const app   = express();
const PORT  = 1919;

// basic middleware
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(cors({ origin: "https://team35.cs144.org", credentials: true }));
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Firebase
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
app.locals.db = db;

// JWT helpers
const SECRET     = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";


function setAuthCookie(res, token) {
  const oneDay = 24 * 60 * 60 * 1000;
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    // NO explicit path  → default is "/"
    maxAge: oneDay,
  });
}


function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function requireAuth(req, res, next) {
  let token = null;
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) token = auth.slice(7);
  else if (req.cookies.jwt)        token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// SINGLE /api/login handler 
app.post("/api/login", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email required" });
  }

   const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
  if (userDoc.empty) {
    return res.status(401).json({ error: "User not found. Please register." });
  }
  const uid = userDoc.docs[0].id;

  const token = signToken({ uid, name, email });
  setAuthCookie(res, token);
  res.json({ token });
});
// POST /api/register  – create user if email not taken
app.post("/api/register", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email required" });
  }

  const snap = await db.collection("users")
                       .where("email", "==", email)
                       .limit(1)
                       .get();
  if (!snap.empty) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const ref   = await db.collection("users").add({ name, email });
  const token = signToken({ uid: ref.id, name, email });
  setAuthCookie(res, token);
  return res.json({ token });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(204).end();
});

// Routers (protect only if needed)
const flightsRouter = require("./routes/flights");
const usersRouter   = require("./routes/users");
const checkinRouter = require("./routes/checkin");
const redisRouter = require("./routes/redis");

// app.use("/flights", flightsRouter);          // public for now (no requireAuth)
// app.use("/users",   usersRouter);
// app.use("/checkin",  checkinRouter);
// app.use("/redis", redisRouter);

app.use("/api/flights", flightsRouter); 
app.use("/api/users",   usersRouter);
app.use("/api/checkin",  checkinRouter);
app.use("/api/redis", redisRouter);

app.get("/test", async (req, res) => {
  const snapshot = await db.collection("flights").get();
  const flights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(flights);
});

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
