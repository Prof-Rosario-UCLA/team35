     # Airline Check-In App

     A we app for managing flight seat bookings, using Redis for caching, FastAPI for the backend API, and React + Nginx for the frontend UI.

     ## 🧱 Components
     - **Redis Service (API)**: FastAPI service that:
     - Seeds Redis with dummy flight data
     - Exposes endpoints to initialize flights, book seats, and check bookings. In **/redis** folder. 
     - **Frontend**: React app served by Nginx to interact with the booking API
     - **Backend**: Not implemented yet. Manages requests, acts as proxy for authentication,security layer, and complex rules, load balancing etc.In the **/server** folder. 
     -- **Firestor**: Not implemented yet. Stores all other data

     ## 🚀 Getting Started

     ### Prerequisites

     - Docker + Docker Compose installed
     - Ports 6379 (Redis), 5000 (Redis-API), and 3000 (Frontend) available

     ### 1. Build and Start Services

     ```bash
     docker compose up --build
     ```

     ### 2. Access the Application

     - **Redis Service (API)**: [http://localhost:5000](http://localhost:5000)
     - **Frontend UI**: [http://localhost:3000](http://localhost:3000)

     ---
     ## Cleanup

     Stop all containers:

     ```bash
     docker compose down
     ```

     Remove images and volumes for a fresh reset:

     ```bash
     docker compose down --rmi all --volumes
     ```

     ---

     ## Notes

     - Redis Service connects to Redis via `REDIS_URL=redis://redis:6379/0`
     - Frontend connects to redis and backend via:
          REACT_APP_API_URL: "http://backend:4000" # API URL for the frontend to communicate with the backend
          Redis_Service_URL: "http://redis-service:5000" # API URL For redis service
     - Make sure the container names match your `docker-compose.yml` if renaming
     - The API endpoints still need to be added.
     - You can edit how your specific project is composed in your own personal docker file, and in the docker compose file.
     - If you want to see the api and data schema of a specific endpoint, if it's using fastAPI(which im using with reddit) just go to thate endpoint(i.e localhost:5000)/docs. i.e 
     go to localhost:5000/docs to check out docs!
     ---

     PING ME IF YOU HAVE ANY QUESTIONS


     # API Documentation

     ## Redis Service API (gRPC)

     The Redis service is implemented using gRPC and runs on port 5000. It provides the following endpoints:

     ### 1. Initialize Flight
     ```protobuf
     rpc InitFlight(InitFlightRequest) returns (google.protobuf.Empty)
     ```

     **Request:**
     ```json
     {
       "flight_id": "string",
       "all_seats": ["string"]  // Array of seat identifiers (e.g., ["1A", "1B", "1C"])
     }
     ```

     **Response:** Empty response on success

     **Error Codes:**
     - `INTERNAL` - If Redis operation fails

     ### 2. Get Free Seats
     ```protobuf
     rpc GetFreeSeats(GetFreeSeatsRequest) returns (GetFreeSeatsResponse)
     ```

     **Request:**
     ```json
     {
       "flight_id": "string"
     }
     ```

     **Response:**
     ```json
     {
       "free_seats": ["string"]  // Array of available seat identifiers
     }
     ```

     **Error Codes:**
     - `NOT_FOUND` - If flight doesn't exist

     ### 3. Book Seat
     ```protobuf
     rpc BookSeat(BookSeatRequest) returns (BookSeatResponse)
     ```

     **Request:**
     ```json
     {
       "flight_id": "string",
       "seat": "string",      // Seat identifier (e.g., "1A")
       "client_id": "string"  // ID of the booking client
     }
     ```

     **Response:**
     ```json
     {
       "booked": boolean  // true if booking succeeded
     }
     ```

     **Error Codes:**
     - `ALREADY_EXISTS` - If seat is already booked or invalid
     - `NOT_FOUND` - If flight doesn't exist

     ### 4. Get Booking
     ```protobuf
     rpc GetBooking(GetBookingRequest) returns (GetBookingResponse)
     ```

     **Request:**
     ```json
     {
       "flight_id": "string",
       "seat": "string"  // Seat identifier
     }
     ```

     **Response:**
     ```json
     {
       "client_id": "string"  // ID of the client who booked the seat
     }
     ```

     **Error Codes:**
     - `NOT_FOUND` - If seat is not booked or flight doesn't exist

     ## Additional API Endpoints

     ### Authentication
     POST /api/login
     Request Body:
     ```json
     {
       "name": "string",
       "email": "string"
     }
     ```
     Response:
     ```json
     {
       "token": "string"  // JWT token for authentication
     }
     ```

     ### Admin Endpoints
     POST /api/admin/upload
     Request Body: FormData with manifest file (CSV or JSON)
     Response:
     ```json
     {
       "message": "Upload successful"
     }
     ```


     ## Example Usages

     ### Initialize a Flight
     ```bash
     curl -X POST http://localhost:5000/flights/ABC123/init \
          -H "Content-Type: application/json" \
          -d '{"all_seats":["A1","A2","A3","A4","A5"]}'
     ```

     ### Get Free Seats
     ```bash
     curl http://localhost:5000/flights/ABC123/free
     ```

     ### Book a Seat
     ```bash
     curl -X POST http://localhost:5000/flights/ABC123/book \
          -H "Content-Type: application/json" \
          -d '{"seat":"A3","client_id":"user42"}'
     ```

     ### Get a Booking
     ```bash
     curl http://localhost:5000/flights/ABC123/booking/A3
     ```

     ### Login
     ```bash
     curl -X POST http://localhost:1919/api/login \
          -H "Content-Type: application/json" \
          -d '{"name":"John Doe","email":"john@example.com"}'
     ```

     ### Upload Flight Manifest (Admin)
     ```bash
     curl -X POST http://localhost:1919/api/admin/upload \
          -F "manifest=@flight_manifest.csv"
     ```

     ### Perform Check-in
     ```bash
     curl -X POST http://localhost:1919/checkin \
          -H "Content-Type: application/json" \
          -d '{"uid":"user123","flightId":"ABC123","seatNumber":"1A"}'
     ```

     Firestore Endpoints
     1. Register a New User
     POST /users
     Request Body:
     {
          "name": "John Doe",
          "email": "john@example.com"
     }

     Response:
     {
          "message": "User registered",
          "id": "generatedFirestoreDocId"
     }

     2. Get User Info
     GET /users/:uid
     Response:
     {
          "name": "John Doe",
          "email": "john@example.com"
     }
     3. Get List of Flights
     GET /flights
     Response:
     [
     {
          "id": "flight123",
          "origin": "LAX",
          "destination": "JFK",
          "departureTime": June 11, 2025 at 8:07:12 AM UTC-7
     },
     {
          "id": "flight456",
          "origin": "SFO",
          "destination": "ORD",
          "departureTime": June 11, 2025 at 8:07:12 AM UTC-7
     }
     ]

     4. Get Flight Details
     GET /flights/:fid (flight ID)
     Response:
     {
          "origin": "LAX",
          "destination": "JFK",
          "departureTime": June 11, 2025 at 8:07:12 AM UTC-7
     }

     5. Get Seat Availability for a Flight
     GET /flights/:fid/seats
     Response:
     [
     {
          "seatNumber": "1A",
          "available": true,
          "userId": null
     },
     {
          "seatNumber": "1B",
          "available": false,
          "userId": "user123"
     }
     ]


     6. Perform Check-in
     POST /flights/:fid/seats/reserve
     Request Body:
     {
          "uid": "user123",
          "seatNumber": "1A"
     }
     Response:
     {
          "message": "Seat reserved and user checkins updated"
     }

     Side Effects:
     Updates the seat document: available: false, userId (ID of reserver): user123
     Creates or updates a document in users/{uid}/checkins/{flightId}


     7. Get User Check-in Information
     GET /checkin/:uid/:fid (flightID)
     Response:
     {
          flightId: “AB1234”
          seatNumber: “12A”
          checkInTime: June 10, 2025 at 2:07:12 AM UTC-7
          origin: “DFW”
          destination: “LAX”
          departureTime: June 11, 2025 at 8:07:12 AM UTC-7
     }


     # TODOS:
     - Implement Protobuff endpoints and finalize data 
     - Complete firebase endpoints
     - Complete reddis endpoints
     - (IMPORTANT)IMPLEMENT UNIT TESTING
     - (IMPORTANT)IMPLEMENT API TESTING WITH POSTMAN
