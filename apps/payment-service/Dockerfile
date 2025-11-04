# Single-stage build for payment-service (optimized for ECS deployment)
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all workspace packages
COPY packages ./packages

# Copy the service
COPY apps/payment-service ./apps/payment-service

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to the service
WORKDIR /app/apps/payment-service

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the service
CMD ["pnpm", "dlx", "tsx", "src/index.ts"]
