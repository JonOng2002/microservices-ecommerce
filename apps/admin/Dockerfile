# Multi-stage build for Next.js admin app
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

# Copy admin source
COPY apps/admin ./apps/admin

# Build the admin app
WORKDIR /app/apps/admin
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Expose port
EXPOSE 3003

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3003

# Run the app
CMD ["node", "apps/admin/server.js"]

