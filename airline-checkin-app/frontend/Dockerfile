# ─── Stage 1: Build the React app ───────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# 1) Copy package manifests and install deps (leverages Docker cache)
COPY package*.json ./
RUN npm ci

# 2) Copy your source code
COPY src/ ./src/
COPY public/ ./public/

# 3) Build the optimized production bundle
RUN npm run build

# ─── Stage 2: Serve with nginx ──────────────────────────────────────────────────
FROM nginx:stable-alpine

# 1) Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# 2) Copy the React build output
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# 3) Expose the HTTP port
EXPOSE 80

# 4) Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]