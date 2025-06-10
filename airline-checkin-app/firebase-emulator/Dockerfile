# Use an official Node.js runtime as a parent image
FROM node:18-slim

# --- ADD THIS SECTION TO INSTALL JAVA ---
# Switch to the root user to install packages
USER root

# Update package lists and install the Java Runtime Environment
RUN apt-get update && \
    apt-get install -y default-jre && \
    rm -rf /var/lib/apt/lists/*
# --------------------------------------

# Install Firebase CLI tools globally
RUN npm install -g firebase-tools

# Set the working directory in the container
WORKDIR /app

# The command to run when the container starts.
# This will now work because Java is installed.
CMD ["firebase", "emulators:start", "--only", "firestore", "--project", "cs144-airline-checkin"]