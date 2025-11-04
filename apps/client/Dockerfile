# Multi-stage build for Next.js client app
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

# Copy package source files (needed for workspace:* dependencies)
COPY packages ./packages

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build stage
FROM base AS builder

# Copy client source
COPY apps/client ./apps/client

# Build the client app
WORKDIR /app/apps/client
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/apps/client/.next/standalone ./
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder /app/apps/client/public ./apps/client/public

# Expose port
EXPOSE 3002

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3002

# Run the app
CMD ["node", "apps/client/server.js"]

