# ─── Step 1: Base node image ───────────────────────────────────────────────────────
FROM node:18-alpine AS base

WORKDIR /usr/src/app

# Install production dependencies only
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/serviceAccountKey.json ./


# ─── Step 3: Copy the rest of your server code ─────────────────────────────────────
COPY server .

# ─── Step 3.5: Copy the ProtoBuff ───────────────────────────────────
COPY protos/ protos

# ─── Step 4: Expose & startup ──────────────────────────────────────────────────────
EXPOSE 1919

# 5) Start the server
#    Replace `index.js` with the entry point of your app if it’s different.
ENTRYPOINT ["node", "index.js"]
