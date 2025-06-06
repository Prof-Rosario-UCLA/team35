import grpc
from concurrent import futures

# Import reflection
from grpc_reflection.v1alpha import reflection

from google.protobuf import empty_pb2, wrappers_pb2
from generated import redis_pb2, redis_pb2_grpc
import flight_cache

class FlightCacheServicer(redis_pb2_grpc.FlightCacheServicer):
    # … your RPC implementations …
    def InitFlight(self, request, context):
        flight_id = request.flight_id
        seat_list = list(request.all_seats)
        try:
            flight_cache.init_flight(flight_id, seat_list)
        except Exception as e:
            context.abort(grpc.StatusCode.INTERNAL, f"InitFlight failed: {e}")
        return empty_pb2.Empty()

    def GetFreeSeats(self, request, context):
        flight_id = request.flight_id
        free_list = flight_cache.get_free_seats(flight_id)
        if free_list is None:
            context.abort(grpc.StatusCode.NOT_FOUND, "Flight not found")
        resp = redis_pb2.GetFreeSeatsResponse()
        resp.free_seats.extend(free_list)
        return resp

    def BookSeat(self, request, context):
        success = flight_cache.book_seat(request.flight_id, request.seat, request.client_id)
        if not success:
            context.abort(grpc.StatusCode.ALREADY_EXISTS, "Seat already booked or invalid.")
        return redis_pb2.BookSeatResponse(booked=True)

    def GetBooking(self, request, context):
        flight_id = request.flight_id
        seat = request.seat
        client = flight_cache.get_booking(flight_id, seat)
        if client is None:
            context.abort(grpc.StatusCode.NOT_FOUND, "Seat not booked or flight not found")
        return redis_pb2.GetBookingResponse(client_id=client)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    redis_pb2_grpc.add_FlightCacheServicer_to_server(FlightCacheServicer(), server)

    # Enable reflection for the FlightCache service
    SERVICE_NAMES = (
        redis_pb2.DESCRIPTOR.services_by_name['FlightCache'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)

    port = "5000"
    server.add_insecure_port(f"[::]:{port}")
    print(f"Starting gRPC server on port {port} …")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
