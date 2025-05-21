const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear previous data
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();

  // Create flight
  const flight = await prisma.flight.create({
    data: {
      code: "AB123",
      destination: "New York",
      departure: new Date("2025-06-01T08:00:00Z"),
    },
  });

  // Create seat map for the flight (e.g., 2 rows, 3 columns: A, B, C)
  const seatLabels = [];
  for (let row = 1; row <= 2; row++) {
    for (let col of ['A', 'B', 'C']) {
      seatLabels.push(`${row}${col}`);
    }
  }

  const seatData = seatLabels.map((label) => ({
    label,
    flightId: flight.id,
    isTaken: false,
  }));

  await prisma.seat.createMany({
    data: seatData,
  });

  console.log(`Seeded flight ${flight.code} with ${seatLabels.length} seats.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
