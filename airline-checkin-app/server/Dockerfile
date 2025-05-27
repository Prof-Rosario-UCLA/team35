# ─── Step 1: Base node image ───────────────────────────────────────────────────────
FROM node:18-alpine AS base

WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# ─── Step 2: Generate Prisma client ────────────────────────────────────────────────
# Copy your Prisma schema & generate the client
COPY prisma ./prisma
RUN npx prisma generate

# ─── Step 3: Copy the rest of your server code ─────────────────────────────────────
COPY . .

# ─── Step 4: Expose & startup ──────────────────────────────────────────────────────
EXPOSE 4000

# On container start:
#   1) run any pending migrations (optional in dev)
#   2) seed dummy flights
#   3) start your Express server
ENTRYPOINT ["sh", "-c", "\
  npx prisma migrate deploy && \
  node prisma/seed.js && \
  node index.js \
"]
