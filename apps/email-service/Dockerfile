# Single-stage build for email-service (optimized for ECS deployment)
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
COPY apps/email-service ./apps/email-service

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to the service
WORKDIR /app/apps/email-service

# No HTTP port - this is a Kafka consumer

# Run the service
CMD ["pnpm", "dlx", "tsx", "src/index.ts"]
