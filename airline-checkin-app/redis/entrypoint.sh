#!/bin/sh
set -e

# 1. Seed Redis (only if you mounted a fresh volume or want to reseed every boot) i.e add sample data( will query from db in future)
echo "→ Running Redis seed…"
python app/seed.py

# 2. Exec the main process (Uvicorn)
echo "→ Starting API server…"
exec uvicorn server.main:app --host 0.0.0.0 --port 8000