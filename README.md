# Microservices E-Commerce Platform

A full-stack e-commerce platform built with microservices architecture, featuring product management, orders, payments, authentication, and inventory tracking.

## 🏗️ Architecture

### Services

- **Product Service** (Port 8000) - Product and category management with PostgreSQL
- **Order Service** (Port 8001) - Order processing with MongoDB
- **Auth Service** (Port 8003) - User management with Clerk
- **Payment Service** (Port 8002) - Payment processing with Stripe
- **Email Service** - Order confirmations via Kafka consumers

### Frontend

- **Client Frontend** (Port 3002) - Customer-facing Next.js app
- **Admin Frontend** (Port 3003) - Admin dashboard Next.js app

### Infrastructure

- **PostgreSQL** - Product data (RDS for production)
- **MongoDB** - Order data (DocumentDB for production)
- **DynamoDB** - Inventory tracking with low-stock alerts
- **Kafka** - Event-driven communication (AWS MSK for production)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm (package manager)
- Docker & Docker Compose
- AWS CLI (for LocalStack)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

```bash
./scripts/setup-local-env.sh
```

Then update `.env` files with your API keys:

- **Clerk**: Get from https://dashboard.clerk.com
- **Stripe**: Get from https://dashboard.stripe.com/apikeys
- See [API Keys Guide](./docs/API_KEYS_GUIDE.md) for details

### 3. Start Local Infrastructure

```bash
# Start databases (PostgreSQL, MongoDB, LocalStack)
docker-compose -f docker-compose.local.yml up -d

# Setup DynamoDB table
./scripts/setup-local-dynamodb.sh

# Start Kafka
cd packages/kafka && docker-compose up -d
```

### 4. Setup Database

```bash
# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate
```

### 5. Start All Services

```bash
pnpm dev
```

This starts:

- ✅ All backend services (8000, 8001, 8002, 8003)
- ✅ Frontend apps (3002, 3003)
- ✅ Kafka consumer services

### 6. Access Applications

- **Client Frontend**: http://localhost:3002
- **Admin Frontend**: http://localhost:3003
- **Kafka UI**: http://localhost:8080
- **Product Service**: http://localhost:8000/health
- **Order Service**: http://localhost:8001/health
- **Payment Service**: http://localhost:8002/health
- **Auth Service**: http://localhost:8003/health

## 📚 Documentation

- [Local Testing Guide](./docs/LOCAL_TESTING.md) - Detailed setup instructions
- [API Keys Guide](./docs/API_KEYS_GUIDE.md) - Required API keys and setup
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) - Complete env var reference
- [ECS Deployment](./docs/ECS_DEPLOYMENT.md) - AWS deployment guide
- [Setup Summary](./docs/SETUP_SUMMARY.md) - Architecture decisions and changes

## 🛠️ Development

### Project Structure
