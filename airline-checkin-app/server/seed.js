const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// The FIRESTORE_EMULATOR_HOST environment variable will be set when we run this script,
// which automatically tells the SDK to connect to the local emulator.
admin.initializeApp({
  projectId: "cs144-airline-checkin",
});

const db = admin.firestore();

// --- Define Your Sample Data ---
const flightsData = [
  {
    id: "AB1234",
    origin: "LAX",
    destination: "JFK",
    departureTime: "2025-08-01T09:00:00Z",
    status: "on-time",
  },
  {
    id: "CD5678",
    origin: "LGA",
    destination: "DFW",
    departureTime: "2025-08-01T14:30:00Z",
    status: "on-time",
  },
];

// Function to generate seats for a flight (e.g., 6 rows, 6 cols)
const generateSeats = () => {
  const seats = [];
  const rows = ["1", "2", "3", "4", "5", "6"];
  const cols = ["A", "B", "C", "D", "E", "F"];
  for (const row of rows) {
    for (const col of cols) {
      const seatId = `${row}${col}`;
      seats.push({
        id: seatId,
        class: "economy",
        available: true,
        userId: null,
      });
    }
  }
  return seats;
};


// --- Seeding Function ---
async function seedDatabase() {
  console.log("Starting to seed the database...");

  // Use a batch to perform all writes at once for efficiency
  const batch = db.batch();

  for (const flight of flightsData) {
    // Set the main flight document
    const flightRef = db.collection("flights").doc(flight.id);
    batch.set(flightRef, flight);

    // Generate and set the seat documents in the subcollection
    const seats = generateSeats();
    for (const seat of seats) {
      const seatRef = flightRef.collection("seats").doc(seat.id);
      batch.set(seatRef, seat);
    }
  }

  // Commit the batch
  await batch.commit();
  console.log("✅ Database seeded successfully!");
}


seedDatabase().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});