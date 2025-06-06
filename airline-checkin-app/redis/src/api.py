import grpc
from concurrent import futures

# Import reflection
from grpc_reflection.v1alpha import reflection

from google.protobuf import empty_pb2, wrappers_pb2
from generated import redis_pb2, redis_pb2_grpc
import flight_cache

class FlightCacheServicer(redis_pb2_grpc.FlightCacheServicer):
    # InitFlight
    def InitFlight(self, request, context):
        print(f"[InitFlight] flight_id={request.flight_id} all_seats={list(request.all_seats)}", flush=True)
        flight_id = request.flight_id
        seat_list = list(request.all_seats)
        try:
            flight_cache.init_flight(flight_id, seat_list)
        except Exception as e:
            print(f"[InitFlight] ERROR: {e}",flush=True)
            context.abort(grpc.StatusCode.INTERNAL, f"InitFlight failed: {e}")
        print(f"[InitFlight] completed", flush=True)
        return empty_pb2.Empty()

    # GetFreeSeats
    def GetFreeSeats(self, request, context):
        print(f"[GetFreeSeats] flight_id={request.flight_id}")
        flight_id = request.flight_id
        free_list = flight_cache.get_free_seats(flight_id)
        if free_list is None:
            print(f"[GetFreeSeats] flight not found", flush=True)
            context.abort(grpc.StatusCode.NOT_FOUND, "Flight not found")
        print(f"[GetFreeSeats] returning {len(free_list)} seats: {free_list}", flush=True)
        resp = redis_pb2.GetFreeSeatsResponse()
        resp.free_seats.extend(free_list)
        return resp

    # BookSeat
    def BookSeat(self, request, context):
        print(f"[BookSeat] flight_id={request.flight_id} seat={request.seat} client_id={request.client_id}")
        success = flight_cache.book_seat(request.flight_id, request.seat, request.client_id)
        if not success:
            print(f"[BookSeat] failed — seat already booked or invalid")
            context.abort(grpc.StatusCode.ALREADY_EXISTS, "Seat already booked or invalid.")
        print(f"[BookSeat] success")
        return redis_pb2.BookSeatResponse(booked=True)

    # GetBooking
    def GetBooking(self, request, context):
        print(f"[GetBooking] flight_id={request.flight_id} seat={request.seat}")
        flight_id = request.flight_id
        seat = request.seat
        client = flight_cache.get_booking(flight_id, seat)
        if client is None:
            print(f"[GetBooking] NOT FOUND")
            context.abort(grpc.StatusCode.NOT_FOUND, "Seat not booked or flight not found")
        print(f"[GetBooking] returning client_id={client}")
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
    print(f"Starting gRPC FlightCache server on port {port} …")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
