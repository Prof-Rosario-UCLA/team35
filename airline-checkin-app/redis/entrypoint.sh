#!/bin/sh
set -e

# 1. Seed Redis (only if you mounted a fresh volume or want to reseed every boot) i.e add sample data( will query from db in future)
echo "→ Running Redis seed…"
python src/seed.py

echo "→ Starting gRPC server…"
# Adjust this path if your gRPC server entry‐point is in a different file.
# For example, if you put your FlightCacheServicer/serve() into src/grpc_server.py:

export PYTHONPATH=/usr/src/generated:$PYTHONPATH

cd src || exit 1
# Start the gRPC server in the background
exec python api.py 
