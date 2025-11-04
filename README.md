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

## 🧪 Local Testing Guide

### Option 1: Run Everything with Docker (Recommended for Production Simulation)

This simulates the production environment where all microservices run in Docker containers.

#### Step 1: Build Docker Images

Build all microservice Docker images:

```bash
# Build all services at once
./test-docker-builds.sh

# Or build individually:
docker build -t product-service:test -f apps/product-service/Dockerfile .
docker build -t order-service:test -f apps/order-service/Dockerfile .
docker build -t payment-service:test -f apps/payment-service/Dockerfile .
docker build -t auth-service:test -f apps/auth-service/Dockerfile .
docker build -t email-service:test -f apps/email-service/Dockerfile .
```

#### Step 2: Setup Environment for Docker

Create `.env.docker-test` file from template:

```bash
# Copy template
cp env.docker-test.template .env.docker-test

# Edit and fill in your values
# Required variables:
# - CLERK_SECRET_KEY
# - CLERK_PUBLISHABLE_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - GOOGLE_CLIENT_ID (for email service)
# - GOOGLE_CLIENT_SECRET (for email service)
# - GOOGLE_REFRESH_TOKEN (for email service)
# - INVENTORY_TABLE_NAME (default: ProductInventory)
```

Or use the automated setup script:

```bash
./setup-docker-test.sh
```

#### Step 3: Start Infrastructure & Services

```bash
# Start all services (PostgreSQL, MongoDB, Kafka, and all microservices)
docker-compose -f docker-compose.test.yml --env-file .env.docker-test up -d

# View logs
docker-compose -f docker-compose.test.yml logs -f

# Check service status
docker ps
```

#### Step 4: Setup Databases

```bash
# Run Prisma migrations for product service
docker exec test-product-service pnpm prisma migrate deploy

# Or if you prefer to run locally:
cd packages/product-db
pnpm prisma migrate deploy
```

#### Step 5: Verify Services are Running

```bash
# Test health endpoints
curl http://localhost:8000/health  # Product Service
curl http://localhost:8001/health  # Order Service
curl http://localhost:8002/health  # Payment Service
curl http://localhost:8003/health   # Auth Service

# Check database connections
docker exec test-product-service pnpm prisma db push
docker exec test-order-service mongosh --eval "db.adminCommand('ping')"
```

#### Step 6: Run Frontends Locally

In separate terminal windows, run the frontend apps:

```bash
# Terminal 1: Client Frontend
cd apps/client
pnpm dev

# Terminal 2: Admin Frontend
cd apps/admin
pnpm dev
```

The frontends will connect to the Dockerized backend services.

#### Step 7: Test the Full Flow

1. **Create a Product** (Admin Panel: http://localhost:3003):
   - Select sizes: L, M, S
   - Enter quantities: e.g., L=10, M=15, S=8
   - Set stock threshold: 5
   - Upload images and submit

2. **Verify Inventory in DynamoDB**:
   ```bash
   aws dynamodb scan --table-name ProductInventory --region ap-southeast-1 --profile is458jon
   ```

3. **Place an Order** (Client: http://localhost:3002):
   - Add product to cart
   - Complete checkout with Stripe
   - Verify order appears in "My Orders"

4. **Verify Inventory Updated**:
   ```bash
   # Check DynamoDB again - quantities should decrease
   aws dynamodb get-item --table-name ProductInventory \
     --key '{"product_id": {"S": "YOUR_PRODUCT_ID"}}' \
     --region ap-southeast-1 --profile is458jon
   ```

#### Step 8: View Logs

```bash
# All services
docker-compose -f docker-compose.test.yml logs -f

# Specific service
docker logs -f test-product-service
docker logs -f test-order-service
docker logs -f test-payment-service
```

#### Step 9: Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.test.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.test.yml down -v
```

### Option 2: Run Everything Locally (Development Mode)

For active development, you can run services locally without Docker:

#### Step 1: Start Infrastructure Only

```bash
# Start databases and Kafka
docker-compose -f docker-compose.test.yml up -d postgres mongodb kafka

# Setup DynamoDB (if using local)
# Or use real AWS DynamoDB (configure AWS_PROFILE)
```

#### Step 2: Run All Services Locally

```bash
# From root directory
pnpm dev

# This starts:
# - Product Service (8000)
# - Order Service (8001)
# - Payment Service (8002)
# - Auth Service (8003)
# - Email Service (Kafka consumer)
# - Client Frontend (3002)
# - Admin Frontend (3003)
```

#### Step 3: Test Endpoints

```bash
# Health checks
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health

# Test product creation
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "shortDescription": "Test",
    "description": "Test description",
    "price": 100,
    "categorySlug": "test-category",
    "sizes": ["l", "m", "s"],
    "colors": ["blue"],
    "images": {"blue": "https://example.com/image.jpg"},
    "quantity_l": 10,
    "quantity_m": 15,
    "quantity_s": 8,
    "stock_threshold": 5
  }'
```

### Rebuilding Docker Images After Code Changes

When you make changes to microservice code, rebuild the Docker image:

```bash
# Rebuild specific service
docker build -t product-service:test -f apps/product-service/Dockerfile .

# Rebuild and restart
docker-compose -f docker-compose.test.yml --env-file .env.docker-test up -d --build product-service

# Or rebuild all
docker-compose -f docker-compose.test.yml --env-file .env.docker-test build
docker-compose -f docker-compose.test.yml --env-file .env.docker-test up -d
```

### Troubleshooting

**Services not starting?**
```bash
# Check logs
docker-compose -f docker-compose.test.yml logs

# Check if ports are available
lsof -i :8000
lsof -i :8001
lsof -i :8002
```

**Database connection issues?**
```bash
# Test PostgreSQL
docker exec -it test-postgres psql -U postgres -d product_db

# Test MongoDB
docker exec -it test-mongodb mongosh -u admin -p admin123
```

**DynamoDB access issues?**
```bash
# Verify AWS credentials
aws sts get-caller-identity --profile is458jon

# Test DynamoDB access
aws dynamodb list-tables --region ap-southeast-1 --profile is458jon
```

## 📚 Documentation

- [Local Testing Guide](./docs/LOCAL_TESTING.md) - Detailed setup instructions
- [API Keys Guide](./docs/API_KEYS_GUIDE.md) - Required API keys and setup
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) - Complete env var reference
- [ECS Deployment](./docs/ECS_DEPLOYMENT.md) - AWS deployment guide
- [Setup Summary](./docs/SETUP_SUMMARY.md) - Architecture decisions and changes

## 🛠️ Development

### Project Structure
