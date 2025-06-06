import time
import grpc
import pytest
import redis as redis_py

from generated import redis_pb2, redis_pb2_grpc
from google.protobuf import empty_pb2

# ─────────────────────────────────────────────────────────────────────────────
# Helpers: wait-for-service
# ─────────────────────────────────────────────────────────────────────────────
def wait_for_grpc(host: str, port: int, timeout: float = 5.0):
    """
    Try opening a gRPC channel to host:port until it succeeds (or timeout).
    """
    deadline = time.time() + timeout
    address = f"{host}:{port}"
    while time.time() < deadline:
        try:
            channel = grpc.insecure_channel(address)
            grpc.channel_ready_future(channel).result(timeout=0.5)
            return channel
        except Exception:
            time.sleep(0.1)
    raise RuntimeError(f"gRPC at {address} never became ready (timeout {timeout}s).")


def wait_for_redis(host: str, port: int, timeout: float = 5.0):
    """
    Ping Redis at host:port until it responds or timeout.
    """
    deadline = time.time() + timeout
    client = redis_py.Redis(host=host, port=port, db=0)
    while time.time() < deadline:
        try:
            if client.ping():
                return client
        except redis_py.exceptions.ConnectionError:
            time.sleep(0.1)
    raise RuntimeError(f"Redis at {host}:{port} never became ready (timeout {timeout}s).")


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures: connect to host‐mapped ports
# ─────────────────────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def grpc_stub():
    """
    Waits for the gRPC container to come online (assumes it's already running
    and listening at redis-service:5000). Returns a FlightCacheStub.
    """
    channel = wait_for_grpc("redis-service", 5000, timeout=10.0)
    return redis_pb2_grpc.FlightCacheStub(channel)


@pytest.fixture(scope="session")
def redis_client():
    """
    Waits for a Redis instance at redis:6379 and returns a redis-py client.
    """
    return wait_for_redis("redis", 6379, timeout=10.0)


# ─────────────────────────────────────────────────────────────────────────────
# The actual tests
# ─────────────────────────────────────────────────────────────────────────────
class TestFlightCacheAgainstContainer:
    @pytest.fixture(autouse=True)
    def _flush_before_each(self, redis_client):
        # Flush DB before each test and again afterward
        redis_client.flushdb()
        yield
        redis_client.flushdb()

    def test_init_and_get_free_seats(self, grpc_stub, redis_client):
        # 1) Call InitFlight("FL1", ["1A","1B","1C"])
        init_req = redis_pb2.InitFlightRequest(
            flight_id="FL1",
            all_seats=["1A", "1B", "1C"]
        )
        resp = grpc_stub.InitFlight(init_req)
        # Should be an empty message (google.protobuf.Empty)
        assert resp == empty_pb2.Empty()

        # 2) Check Redis directly that the free set is populated
        free_key = "flight:FL1:free"
        members = {b.decode() for b in redis_client.smembers(free_key)}
        assert members == {"1A", "1B", "1C"}

        # 3) Call GetFreeSeats("FL1") and verify gRPC response
        get_free_req = redis_pb2.GetFreeSeatsRequest(flight_id="FL1")
        free_resp = grpc_stub.GetFreeSeats(get_free_req)
        # free_resp is a GetFreeSeatsResponse, which has `repeated string free_seats`
        assert set(free_resp.free_seats) == {"1A", "1B", "1C"}

    def test_get_free_seats_not_found(self, grpc_stub):
        # Flight “NOPE” was never initialized → expect NOT_FOUND
        with pytest.raises(grpc.RpcError) as exc:
            grpc_stub.GetFreeSeats(
                redis_pb2.GetFreeSeatsRequest(flight_id="NOPE")
            )
        assert exc.value.code() == grpc.StatusCode.NOT_FOUND

    def test_book_and_get_booking(self, grpc_stub, redis_client):
        # 1) Init FL2
        grpc_stub.InitFlight(
            redis_pb2.InitFlightRequest(
                flight_id="FL2",
                all_seats=["5A", "5B"]
            )
        )

        # 2) Book 5A for “Alice”
        book_resp = grpc_stub.BookSeat(
            redis_pb2.BookSeatRequest(
                flight_id="FL2",
                seat="5A",
                client_id="Alice"
            )
        )
        assert book_resp.booked is True

        # 3) Redis should now have 5A removed from free, and in booked
        free_members = {b.decode() for b in redis_client.smembers("flight:FL2:free")}
        assert "5A" not in free_members and "5B" in free_members

        booked_client = redis_client.hget("flight:FL2:booked", "5A").decode()
        assert booked_client == "Alice"

        # 4) GetBooking for “5A” should return “Alice”
        get_booking_req = redis_pb2.GetBookingRequest(flight_id="FL2", seat="5A")
        get_resp = grpc_stub.GetBooking(get_booking_req)
        assert get_resp.client_id == "Alice"

        # 5) Double‐book “5A” → expect ALREADY_EXISTS
        with pytest.raises(grpc.RpcError) as exc2:
            grpc_stub.BookSeat(
                redis_pb2.BookSeatRequest(
                    flight_id="FL2",
                    seat="5A",
                    client_id="Bob"
                )
            )
        assert exc2.value.code() == grpc.StatusCode.ALREADY_EXISTS

        # 6) Query an unbooked seat (5B) → NOT_FOUND
        with pytest.raises(grpc.RpcError) as exc3:
            grpc_stub.GetBooking(
                redis_pb2.GetBookingRequest(flight_id="FL2", seat="5B")
            )
        assert exc3.value.code() == grpc.StatusCode.NOT_FOUND

    def test_book_invalid_flight(self, grpc_stub):
        # Attempt to book on a flight that does not exist → ALREADY_EXISTS
        with pytest.raises(grpc.RpcError) as exc:
            grpc_stub.BookSeat(
                redis_pb2.BookSeatRequest(
                    flight_id="UNKNOWN",
                    seat="X1",
                    client_id="Z"
                )
            )
        assert exc.value.code() == grpc.StatusCode.ALREADY_EXISTS

    def test_init_flight_redis_failure(self, grpc_stub, monkeypatch):
        # Simulate a Redis failure by patching flight_cache.init_flight to raise
        import flight_cache as fc
        monkeypatch.setattr(
            fc,
            "init_flight",
            lambda *args, **kwargs: (_ for _ in ()).throw(
                redis_py.ConnectionError("boom")
            )
        )

        with pytest.raises(grpc.RpcError) as exc:
            grpc_stub.InitFlight(
                redis_pb2.InitFlightRequest(
                    flight_id="FLX",
                    all_seats=["A1", "A2"]
                )
            )
        assert exc.value.code() == grpc.StatusCode.INTERNAL
        assert "InitFlight failed" in exc.value.details()
