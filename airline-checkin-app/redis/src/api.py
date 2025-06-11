import json
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
        seat_list = list(request.allSeats)
        seat_ids = [seat.id for seat in seat_list]
        print(f"[InitFlight] flight_id={request.flightId} seat_ids={seat_ids}", flush=True)
        flight_id = request.flightId
        try:
            flight_cache.init_flight(flight_id, seat_list)
        except Exception as e:
            print(f"[InitFlight] ERROR: {e}",flush=True)
            context.abort(grpc.StatusCode.INTERNAL, f"InitFlight failed: {e}")
        print(f"[InitFlight] completed", flush=True)
        return empty_pb2.Empty()

    # GetFreeSeats
    def GetFreeSeats(self, request, context):
        print(f"[GetFreeSeats] flight_id={request.flightId}", flush=True)
        flightId = request.flightId

        # Get the seats JSON from Redis
        free_seats = flight_cache.get_free_seats(flightId)
        print(f"[GetFreeSeats] free_seats={free_seats}", flush=True)
        if free_seats is None:
            print(f"[GetFreeSeats] flight not found", flush=True)
            context.abort(grpc.StatusCode.NOT_FOUND, "Flight not found")
        free_seats = json.loads(free_seats.decode("utf-8"))
        print(f"[GetFreeSeats] decoded free_seats={free_seats}", flush=True)
        # Build proto response
        resp = redis_pb2.GetFreeSeatsResponse()
        for seat_dict in free_seats:
            seat_msg = redis_pb2.Seat(
                id=seat_dict["id"],
                available=seat_dict["available"],
                userId=seat_dict["userId"],
                class_=seat_dict["class_"]  # Note: use class_ if your proto uses `class`
            )
            resp.allSeats.append(seat_msg)
        return resp


    # BookSeat
    def BookSeat(self, request, context):
        print(f"[BookSeat] flight_id={request.flightId} seat={request.seat} client_id={request.clientId}")
        success = flight_cache.book_seat(request.flightId, request.seat, request.clientId)
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
