# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./

COPY src/ ./src/

# Compile TypeScript to dist/
RUN npm run build




# Stage 2: Production
FROM node:24-alpine AS production

# dumb-init ensures signals (SIGTERM/SIGINT) are forwarded correctly to Node
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
