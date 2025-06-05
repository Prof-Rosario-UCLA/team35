from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import redis
from .flight_cache import init_flight, get_free_seats, book_seat, get_booking

# # Redis connection
r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))

# # FastAPI app
app = FastAPI()

# ----- Data Models ----- temp until base protobuff
class InitFlightRequest(BaseModel):
    all_seats: list[str]

class BookSeatRequest(BaseModel):
    seat: str
    client_id: str

# ----- API Endpoints -----
@app.post("/flights/{flight_id}/init", status_code=204)
def init_flight_endpoint(flight_id: str, req: InitFlightRequest):
    """Initialize a flight's seats."""
    init_flight(flight_id, req.all_seats)
    return None

@app.get("/flights/{flight_id}/free")
def free_seats_endpoint(flight_id: str):
    """Get list of free seats for a flight."""
    return {"free_seats": get_free_seats(flight_id)}

@app.post("/flights/{flight_id}/book")
def book_seat_endpoint(flight_id: str, req: BookSeatRequest):
    """Attempt to book a seat for a client."""
    success = book_seat(flight_id, req.seat, req.client_id)
    if not success:
        raise HTTPException(status_code=409, detail="Seat already booked or invalid.")
    return {"booked": True}

@app.get("/flights/{flight_id}/booking/{seat}")
def get_booking_endpoint(flight_id: str, seat: str):
    """Get client ID for a booked seat, or 404 if unbooked."""
    client = get_booking(flight_id, seat)
    if client is None:
        raise HTTPException(status_code=404, detail="Seat is not booked.")
    return {"client_id": client}
