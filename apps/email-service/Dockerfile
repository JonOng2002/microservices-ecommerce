# Multi-stage build for email-service
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all package.json files for workspace dependencies
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

# Copy all source files
COPY packages ./packages
COPY apps/email-service ./apps/email-service

# Build the service
WORKDIR /app
RUN pnpm --filter email-service build || echo "Build may not be required"

# Production stage
FROM base AS runner

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/email-service ./apps/email-service

# Copy package.json files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/email-service/package.json ./apps/email-service/

# Set working directory to service
WORKDIR /app/apps/email-service

# Health check (email-service doesn't have HTTP, so skip)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "console.log('healthy')"

# Run the service
CMD ["pnpm", "dlx", "tsx", "--env-file=.env", "src/index.ts"]

