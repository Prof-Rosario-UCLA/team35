import os
import redis

# connect via REDIS_URL or localhost
r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))



# Key for tracking all flight IDs
FLIGHTS_KEY = "flights"

def init_flight(flight_id: str, all_seats: list[str]):
    """Seed the free-seats set and clear any old bookings."""
    free_key = f"flight:{flight_id}:free"
    book_key = f"flight:{flight_id}:bookings"
    # overwrite existing
    pipe = r.pipeline()
    pipe.delete(free_key, book_key)
    if all_seats:
        pipe.sadd(free_key, *all_seats)
    pipe.execute()

def get_free_seats(flight_id: str) -> set[str]:
    return r.smembers(f"flight:{flight_id}:free")

def book_seat(flight_id: str, seat: str, client_id: str) -> bool:
    """
    Atomically remove seat from 'free' and record in 'bookings'.
    Returns True if booking succeeded, False if seat was already taken.
    """
    free_key = f"flight:{flight_id}:free"
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