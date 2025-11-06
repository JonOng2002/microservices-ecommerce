# Single-stage build for auth-service (optimized for ECS deployment)
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all workspace packages
COPY packages ./packages

# Copy the service
COPY apps/auth-service ./apps/auth-service

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to the service
WORKDIR /app/apps/auth-service

# Expose port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the service
CMD ["pnpm", "dlx", "tsx", "src/index.ts"]
