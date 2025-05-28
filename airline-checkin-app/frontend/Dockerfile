# syntax=docker/dockerfile:1.4

# ─── Stage 1: Build the React app ───────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# 1) Copy only the lockfiles first, so this layer is cached unless they change
COPY package.json package-lock.json ./

# 2) Install deps with BuildKit cache on ~/.npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 3) Copy the rest of your source
COPY public/ ./public/
COPY src/    ./src/

# 4) Build
RUN npm run build

# ─── Stage 2: Serve with nginx ──────────────────────────────────────────────────
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*  
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
