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

---

PING ME IF YOU HAVE ANY QUESTIONS


# APIS:

## API Endpoints For Redis
(These may not all work yet)
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

---


# API Endpoints for Backend
TODO

# API Endpoints for Firebase
TODO

# TODOS:
- Implement Protobuff endpoints and finalize data 
- Complete firebase endpoints
- Complete reddis endpoints
- (IMPORTANT)IMPLEMENT UNIT TESTING
- (IMPORTANT)IMPLEMENT API TESTING WITH POSTMAN
