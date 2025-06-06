#!/usr/bin/env bash
set -e

# 1) Clear out any old generated files
rm -rf redis/src/generated/*
mkdir -p redis/src/generated

# 2) Compile every .proto under /protos
#    The find command will locate all .proto files, and for each one:
#      --proto_path=protos      tells protoc where to look for imports
#      --python_out=redis/src/generated
#      --grpc_python_out=redis/src/generated
#
#    Adjust these paths if you want the stubs in a different folder.

find protos -name '*.proto' | while read -r PROTO; do
  python -m grpc_tools.protoc \
    --proto_path=protos \
    --python_out=redis/src/generated \
    --grpc_python_out=redis/src/generated \
    "$PROTO"
done

echo "✅ All .proto files compiled into redis/src/generated/"
