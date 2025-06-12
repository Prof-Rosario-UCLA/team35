import os
import redis
import json

# connect via REDIS_URL or localhost
# r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
# Get the Redis URL from the environment variable.
redis_url = os.getenv("REDIS_URL")

# If the environment variable is not set, raise an error to prevent the app from starting incorrectly.
if not redis_url:
    raise ValueError("REDIS_URL environment variable is not set. Cannot connect to Redis.")

# Connect to Redis using the provided URL.
r = redis.from_url(redis_url)

# Key for tracking all flight IDs
FLIGHTS_KEY = "flights"


def init_flight(flight_id: str, seat_list):
    """Seed the full seats list as JSON and clear any old bookings."""
    print(f"Initializing flight {flight_id} with seats: {[seat.id for seat in seat_list]}", flush=True)

    free_key = f"flight:{flight_id}:seats"    # <--- key for full seats JSON
    book_key = f"flight:{flight_id}:bookings"

    # Convert Seat proto objects → list of dicts
    seat_dicts = []
    print(f"FUNCTION: flight_id={flight_id} free_key={free_key} book_key={book_key}", flush=True)
    for seat in seat_list:
        print("Testin")
        print(f"FUNCTION: seat={seat}", flush=True)
        print(f"FUNCTION: seat.id={seat.id} userId={seat.userId} available={seat.available} class={seat.class_}", flush=True)
        seat_dicts.append({
            "id": seat.id,
            "available": seat.available,
            "userId": seat.userId,
            "class_": seat.class_ 
        })
        print()
    print(f"FUNCTION: seat_dicts={seat_dicts}", flush=True)
    # Store as JSON string
    pipe = r.pipeline()
    pipe.delete(free_key, book_key)
    pipe.set(free_key, json.dumps(seat_dicts))
    pipe.execute()


def get_free_seats(flight_id: str) -> set[str]:
    print(f"Getting free seats for flight {flight_id}", flush=True)
    return r.get(f"flight:{flight_id}:seats")

def book_seat(flight_id: str, seat: str, client_id: str) -> bool:
    """
    Atomically remove seat from 'free' and record in 'bookings'.
    Returns True if booking succeeded, False if seat was already taken.
    """
    free_key = f"flight:{flight_id}:seats"
    book_key = f"flight:{flight_id}:bookings"
    lua = """
    if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 1 then
      redis.call('SREM', KEYS[1], ARGV[1])
      redis.call('HSET', KEYS[2], ARGV[1], ARGV[2])
      return 1
    else
      return 0
    end
    """
    ok = r.eval(lua, 2, free_key, book_key, seat, client_id)
    return bool(ok)

def get_booking(flight_id: str, seat: str) -> str | None:
    return r.hget(f"flight:{flight_id}:bookings", seat)


def add_flight(flight_id: str) -> None:
    """
    Registers a flight ID in the global flights set.
    Call this when initializing a new flight.
    """
    r.sadd(FLIGHTS_KEY, flight_id)


def remove_flight(flight_id: str) -> None:
    """
    Removes a flight ID from the global flights set.
    Call this when a flight is retired or no longer tracked.
    """
    r.srem(FLIGHTS_KEY, flight_id)