# Multi-stage build for optimal image size and security
# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Copy source code and build
COPY . .

# Run production build (Vite client SPA -> dist/, esbuild backend server -> dist/server.cjs)
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Port 3000 is required for container ingress routing and Cloud Run
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production --prefer-offline --no-audit && npm cache clean --force

# Copy compiled frontend and bundled server from builder
COPY --from=builder /app/dist ./dist
# Copy firebase config for runtime authentication
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/data && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Start production server
CMD ["node", "dist/server.cjs"]
