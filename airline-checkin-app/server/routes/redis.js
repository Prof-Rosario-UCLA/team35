// backend/src/redis.js
const express = require("express");
const router = express.Router();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// 1) Dynamic .proto loading
const PROTO_PATH = path.join(__dirname, "../protos/redis.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObject = grpc.loadPackageDefinition(packageDefinition).flightcache;

// 2) Extract service client
const FlightCacheClient = grpcObject.FlightCache;

// 3) Create a single FlightCache client stub
const flightCacheClient = new FlightCacheClient(
  "redis-service:5000", // use your real service name!
  grpc.credentials.createInsecure()
);

flightCacheClient.waitForReady(Date.now() + 5000, (err) => {
  if (err) {
    console.error("gRPC FlightCache client failed to connect:", err);
  } else {
    console.log("gRPC FlightCache client connected to redis-service:5000");
    console.log(
      "Available methods:",
      Object.keys(flightCacheClient.__proto__)
    );

  }
});

// ────────────────────────────────────────────────────────────────────────────────
// Endpoint 1: POST /redis/init → InitFlight
// ────────────────────────────────────────────────────────────────────────────────
router.post("/init", (req, res) => {
  const { flightId, allSeats } = req.body;
  console.log(`[POST /redis/init] flightId=${flightId} allSeats=`, allSeats);
  
  if (typeof flightId !== "string" || !Array.isArray(allSeats)) {
    return res
      .status(400)
      .json({ error: "flightId must be a string and allSeats must be an array" });
  }

  const pbRequest = {
    flightId: flightId,
    allSeats: allSeats,
  };


  console.log(`[gRPC InitFlight request]`, pbRequest);

  flightCacheClient.InitFlight(pbRequest, (err, response) => {
    if (err) {
      console.error(
        `gRPC InitFlight error:`,
        err.code,
        err.details || err.message
      );
      return res
        .status(500)
        .json({ error: "Unable to initialize flight via gRPC service." });
    }

    console.log(`[gRPC InitFlight response] OK`);
    return res.sendStatus(204);
  });
});

// ────────────────────────────────────────────────────────────────────────────────
// Endpoint 2: GET /redis/free/:flightId → GetFreeSeats
// ────────────────────────────────────────────────────────────────────────────────
router.get("/free/:flightId", (req, res) => {
  const { flightId } = req.params;
  console.log(`[GET /redis/free/${flightId}]`);

  if (typeof flightId !== "string") {
    return res.status(400).json({ error: "flightId must be a string" });
  }

  const pbRequest = { flightId: flightId };
  console.log(`[gRPC GetFreeSeats request]`, pbRequest);
  
  flightCacheClient.GetFreeSeats(pbRequest, (err, response) => {
    if (err) {
      if (err.code === grpc.status.NOT_FOUND) {
        console.warn(`[gRPC GetFreeSeats] flight not found`);
        return res.status(404).json({ error: "Flight not found" });
      }
      console.error(
        "gRPC GetFreeSeats error:",
        err.code,
        err.details || err.message
      );
      return res
        .status(500)
        .json({ error: "Unable to retrieve free seats via gRPC service." });
    }

    console.log(
      `[gRPC GetFreeSeats response] free_seats=${response.free_seats}`
    );
    return res.json(response.allSeats);
  });
});

// ────────────────────────────────────────────────────────────────────────────────
// Endpoint 3: POST /redis/book → BookSeat
// ────────────────────────────────────────────────────────────────────────────────
router.post("/book", (req, res) => {
  const { uid, flightId, seatNumber } = req.body;
  console.log(
    `[POST /redis/book] uid=${uid} flightId=${flightId} seatNumber=${seatNumber}`
  );

  if (
    typeof uid !== "string" ||
    typeof flightId !== "string" ||
    typeof seatNumber !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "uid, flightId, and seatNumber must be strings" });
  }

  const pbRequest = {
    flight_id: flightId,
    seat: seatNumber,
    client_id: uid,
  };

  console.log(`[gRPC BookSeat request]`, pbRequest);

  flightCacheClient.BookSeat(pbRequest, (err, response) => {
    if (err) {
      if (err.code === grpc.status.ALREADY_EXISTS) {
        console.warn(`[gRPC BookSeat] seat already booked or invalid`);
        return res
          .status(409)
          .json({ error: "Seat is already booked or invalid." });
      }
      console.error(
        "gRPC BookSeat error:",
        err.code,
        err.details || err.message
      );
      return res
        .status(500)
        .json({ error: "Unable to book seat via gRPC service." });
    }

    console.log(`[gRPC BookSeat response] booked=${response.booked}`);
    return res.json({
      message: "Booked successfully",
      booked: response.booked,
    });
  });
});

module.exports = router;
