# app/seed.py
import os, uuid, random
import reddis
from flight_cache import *

# connect
r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))


# Seed dummy flights with random bookings for example/ testin purposes.
def seed_dummy_flights(num_flights: int = 5):
    random.seed(42)
    clients = [f"client{n}" for n in range(1, 21)]
    for _ in range(num_flights):
        flight_id = uuid.uuid4().hex[:8]
        rows = range(1, 31); cols = ["A","B","C","D","E","F"]
        all_seats = [f"{row}{col}" for row in rows for col in cols]
        init_flight(flight_id, all_seats)
        num_to_book = random.randint(0, len(all_seats)//2)
        for seat in random.sample(all_seats, num_to_book):
            book_seat(flight_id, seat, random.choice(clients))
        print(f"Seeded {flight_id}: {len(all_seats)} seats, {num_to_book} booked")

if __name__ == "__main__":
    seed_dummy_flights(num_flights=int(os.getenv("NUM_FLIGHTS", "10")))