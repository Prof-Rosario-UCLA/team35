# Airline Check-In & Booking App

Welcome to the Airline Check-In & Booking App, a comprehensive web application for managing flight bookings. This system features a modern, decoupled architecture with a React frontend, a Node.js backend, and a high-performance caching layer using Redis and gRPC.

## Application Architecture

The application is composed of several microservices designed to work together, whether running locally with Docker Compose or deployed in a Kubernetes cluster:

  - **Frontend**: A responsive React single-page application served by Nginx. It handles user interaction, seat selection, and communicates with the backend API.
  - **Backend**: A Node.js (Express) server that acts as the primary API gateway. It manages user authentication (JWT), business logic, and communicates with the Firestore database and the Redis caching service.
  - **Redis gRPC Service**: A Python gRPC service that provides a dedicated API for interacting with the Redis cache, handling operations like initializing flights and booking seats.
  - **Redis**: An in-memory data store used for caching available flights and seat maps for fast access.
  - **Firestore**: The primary persistent database for storing core data such as user profiles, flight manifests, and confirmed bookings.

## Tech Stack

  - **Frontend**: React, React Router, WebAssembly (for seat encoding), Nginx (as web server)
  - **Backend**: Node.js, Express.js
  - **API & Communication**: REST, gRPC, Protocol Buffers
  - **Databases & Caching**: Google Cloud Firestore, Redis
  - **Authentication**: JSON Web Tokens (JWT)
  - **Containerization**: Docker, Docker Compose
  - **Cloud**: Kubernetes (designed for GKE)

## Getting Started

### Prerequisites

  - Docker & Docker Compose
  - `kubectl` (for Kubernetes deployment)
  - Google Cloud SDK (`gcloud`) (for GKE deployment)
  - Node.js and npm

### Local Development (Docker Compose)

The easiest way to run the entire application stack on your local machine is with Docker Compose.

1.  **Build and Start All Services:**
    From the root of the project, run:

    ```bash
    docker compose up --build
    ```

    This command will build the images for the frontend, backend, and redis-service, and start all containers.

2.  **Access the Application:**

      - **Frontend UI**: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
      - **Backend API**: [http://localhost:1919](https://www.google.com/search?q=http://localhost:1919)
      - **Redis gRPC Service**: `localhost:5000`

3.  **Stopping the Application:**
    To stop all running containers, press `Ctrl+C` in the terminal and then run:

    ```bash
    docker compose down
    ```

### Kubernetes Deployment (GKE)

This project is configured for deployment on Google Kubernetes Engine (GKE).

1.  **Build and Push Docker Images:**
    Build the Docker images for the `frontend`, `backend`, and `redis-service` and push them to a container registry (like Google Container Registry - GCR). Ensure the image paths in your `.yaml` files (`gcr.io/cs144proj/...`) are updated accordingly.

2.  **Configure Your Domain:**
    Update `managed-certificate.yaml` with your actual domain name.

3.  **Apply the Kubernetes Manifests:**
    Apply all the service and deployment configurations to your cluster.

    ```bash
    kubectl apply -f .
    ```

    *Note: Ensure your `kubectl` is configured to point to your GKE cluster.*

-----

## API Documentation

### Backend REST API (localhost:1919)

#### Authentication

  - **`POST /api/register`**: Creates a new user account.
      - **Body**: `{ "name": "string", "email": "string" }`
      - **Response**: `{ "token": "string" }`
  - **`POST /api/login`**: Authenticates a user and returns a JWT.
      - **Body**: `{ "name": "string", "email": "string" }`
      - **Response**: `{ "token": "string" }`
  - **`POST /api/logout`**: Clears the authentication cookie.

#### Flights & Seats

  - **`GET /api/flights`**: Returns a list of all available flights.
  - **`GET /api/flights/:fid`**: Gets details for a specific flight.
  - **`GET /api/flights/:fid/seats`**: Gets the seat availability for a specific flight.
  - **`POST /api/flights/:fid/seats/reserve`**: Reserves a seat for the logged-in user.
      - **Body**: `{ "uid": "string", "seatNumber": "string" }`

#### Users

  - **`GET /api/users/:uid/checkins`**: Get all check-ins for a user, including flight details.

### Redis gRPC Service (localhost:5000)

This service manages the Redis cache via gRPC.

  - **`rpc InitFlight(InitFlightRequest) returns (google.protobuf.Empty)`**
      - Initializes or resets a flight's seat cache in Redis.
  - **`rpc GetFreeSeats(GetFreeSeatsRequest) returns (GetFreeSeatsResponse)`**
      - Retrieves all available seats for a flight from the cache.
  - **`rpc BookSeat(BookSeatRequest) returns (BookSeatResponse)`**
      - Atomically marks a seat as booked in the cache.
  - **`rpc GetBooking(GetBookingRequest) returns (GetBookingResponse)`**
      - Retrieves the client ID for a specific booked seat.
