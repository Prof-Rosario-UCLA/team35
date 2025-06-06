# ================================================
# redis/Dockerfile
# ================================================

# 1) Base image
FROM python:3.11-slim

# 2) Set a working directory where we’ll do the compilation
WORKDIR /usr 


# 8) Copy the runtime dependencies (only grpcio, redis, etc.—no grpcio-tools)
#    ───────────────────────────────────────────────────────
COPY redis/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt


COPY protos/ ./proto/
COPY redis/src/ ./src/


# 9) Generate Python code from your .proto files
#    ────────────────────────────────────────────────────────────────
RUN python -m grpc_tools.protoc \
      --proto_path=proto \
      --python_out=src/generated \
      --grpc_python_out=src/generated \
      proto/redis.proto \
      proto/common.proto

COPY redis/src/generated/__init__.py src/generated/

# 10) Copy entrypoint and make it executable
#     ─────────────────────────────────────────────
COPY redis/entrypoint.sh .
RUN chmod +x entrypoint.sh

# 11) Expose whichever port your gRPC server uses
EXPOSE 5000
# RUN GRPC_VERBOSITY=DEBUG GRPC_TRACE=all python api.py

# 12) Run the entrypoint (which should start your gRPC server in the foreground)
ENTRYPOINT ["./entrypoint.sh"]
