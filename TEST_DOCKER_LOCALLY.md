# 🐳 Testing Docker Images Locally (ECS Fargate Simulation)

This guide helps you test your built Docker images locally to simulate how they'll run on AWS ECS Fargate.

---

## 🎯 What This Tests

✅ **Built Docker images** (not source code)  
✅ **Bundled dependencies** (all workspace packages included)  
✅ **Environment variables** (like ECS Task Definitions)  
✅ **Container networking** (services talking to each other)  
✅ **Production mode** (no hot-reload)  

---

## 📋 Prerequisites

- Docker and Docker Compose installed
- AWS credentials configured (`~/.aws/credentials`)
- All microservices built as Docker images

---

## 🚀 Quick Start

### **Step 1: Build Docker Images**

```bash
# Build all microservices
./test-docker-builds.sh
```

This creates:
- `product-service:test`
- `order-service:test`
- `payment-service:test`
- `auth-service:test`
- `email-service:test`

---

### **Step 2: Configure Environment Variables**

```bash
# Copy the template
cp env.docker-test.template .env.docker-test

# Edit with your actual API keys
nano .env.docker-test
# or
code .env.docker-test
```

**Required values:**
```bash
CLERK_SECRET_KEY=sk_test_...           # From apps/auth-service/.env
CLERK_PUBLISHABLE_KEY=pk_test_...      # From apps/auth-service/.env
STRIPE_SECRET_KEY=sk_test_...          # From apps/payment-service/.env
```

**Optional values** (for email testing):
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

---

### **Step 3: Start Services**

```bash
# Start all services (with logs visible)
docker-compose -f docker-compose.test.yml --env-file .env.docker-test up

# Or run in background (detached mode)
docker-compose -f docker-compose.test.yml --env-file .env.docker-test up -d
```

**Wait for services to start** (check health checks):
```bash
docker-compose -f docker-compose.test.yml ps
```

---

### **Step 4: Test the Services**

#### **Health Checks:**
```bash
curl http://localhost:8000/health  # product-service
curl http://localhost:8001/health  # order-service
curl http://localhost:8002/health  # payment-service
curl http://localhost:8003/health  # auth-service
```

#### **Test Endpoints:**
```bash
# Get products
curl http://localhost:8000/products

# Get categories
curl http://localhost:8000/categories
```

---

### **Step 5: View Logs**

```bash
# All services
docker-compose -f docker-compose.test.yml logs -f

# Specific service
docker-compose -f docker-compose.test.yml logs -f product-service
docker-compose -f docker-compose.test.yml logs -f order-service
docker-compose -f docker-compose.test.yml logs -f kafka

# Last 50 lines
docker-compose -f docker-compose.test.yml logs --tail=50
```

---

### **Step 6: Stop Services**

```bash
# Stop and remove containers (keeps volumes)
docker-compose -f docker-compose.test.yml down

# Stop and remove everything including volumes
docker-compose -f docker-compose.test.yml down -v
```

---

## 🔍 What's Running

### **Infrastructure:**
- **PostgreSQL** → `localhost:5432` (Product data)
- **MongoDB** → `localhost:27017` (Order data)
- **Kafka** → `localhost:9092` (Event streaming)

### **Microservices:**
- **product-service** → `localhost:8000`
- **order-service** → `localhost:8001`
- **payment-service** → `localhost:8002`
- **auth-service** → `localhost:8003`
- **email-service** → (no HTTP port, Kafka consumer)

---

## 🐛 Troubleshooting

### **Service Won't Start**

```bash
# Check logs for errors
docker-compose -f docker-compose.test.yml logs product-service

# Common issues:
# - Missing API keys in .env.docker-test
# - Database not ready (wait for health checks)
# - Port already in use (stop local dev services)
```

### **Database Connection Errors**

```bash
# Check if databases are healthy
docker-compose -f docker-compose.test.yml ps

# Should show "healthy" status
# If not, wait 30 seconds and check again

# Force restart databases
docker-compose -f docker-compose.test.yml restart postgres mongodb kafka
```

### **Kafka Connection Issues**

```bash
# Check Kafka is running
docker-compose -f docker-compose.test.yml logs kafka

# Check Kafka health
docker exec test-kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### **AWS/DynamoDB Errors**

```bash
# Verify AWS credentials are mounted
docker-compose -f docker-compose.test.yml exec product-service cat /root/.aws/credentials

# Check AWS region
docker-compose -f docker-compose.test.yml exec product-service env | grep AWS
```

### **Port Already in Use**

```bash
# Stop local development services first
pnpm dev  # Press Ctrl+C to stop

# Or kill specific ports
lsof -ti:8000 | xargs kill  # product-service
lsof -ti:8001 | xargs kill  # order-service
lsof -ti:8002 | xargs kill  # payment-service
lsof -ti:8003 | xargs kill  # auth-service
```

---

## 🔄 Rebuild After Code Changes

```bash
# 1. Stop running containers
docker-compose -f docker-compose.test.yml down

# 2. Rebuild Docker images
./test-docker-builds.sh

# 3. Start again
docker-compose -f docker-compose.test.yml --env-file .env.docker-test up
```

---

## 🎯 Testing Checklist

- [ ] All services start successfully
- [ ] Health checks pass (all services "healthy")
- [ ] Product service returns products
- [ ] Order service connects to MongoDB
- [ ] Payment service validates with Stripe
- [ ] Auth service validates Clerk tokens
- [ ] Kafka events flowing (check logs)
- [ ] S3 image upload works (if testing)
- [ ] DynamoDB inventory updates (if testing)

---

## 📊 Compare: Local Dev vs Docker Test vs ECS Fargate

| Aspect | `pnpm dev` | `docker-compose.test.yml` | ECS Fargate |
|--------|-----------|--------------------------|-------------|
| **Source** | Source files | ✅ Built images | ✅ Built images |
| **Dependencies** | node_modules | ✅ Bundled | ✅ Bundled |
| **Hot Reload** | Yes | ❌ Production | ❌ Production |
| **Isolation** | Shared | ✅ Containers | ✅ Containers |
| **DB Packages** | Workspace | ✅ Bundled | ✅ Bundled |
| **Environment** | .env files | ✅ Env vars | ✅ SSM Parameters |
| **Databases** | Docker | Docker | RDS/DocumentDB |
| **Networking** | localhost | ✅ Docker network | ✅ VPC/ALB |

---

## 💡 Tips

1. **Use this for final testing** before deploying to AWS
2. **Test after every Dockerfile change** to catch issues early
3. **Keep .env.docker-test up to date** with latest API keys
4. **Monitor logs** to see inter-service communication
5. **Test Kafka events** by triggering actions (create order, etc.)

---

## 🚀 Next Steps

After successful local Docker testing:

1. ✅ **Push images to ECR**
   ```bash
   # Tag and push
   docker tag product-service:test 043509841384.dkr.ecr.ap-southeast-1.amazonaws.com/product-service:latest
   docker push 043509841384.dkr.ecr.ap-southeast-1.amazonaws.com/product-service:latest
   ```

2. ✅ **Create ECS Task Definitions**
   - Use same environment variables
   - Point to ECR image URLs
   - Configure CPU/memory

3. ✅ **Deploy ECS Services**
   - One service per microservice
   - Connect to Application Load Balancer
   - Set up auto-scaling

---

## 🔗 Related Files

- `docker-compose.test.yml` - Docker Compose for testing
- `env.docker-test.template` - Environment variable template
- `test-docker-builds.sh` - Build script for all services
- `build-docker-multiplatform.sh` - Multi-platform builds for ECR

---

## ❓ FAQ

**Q: Why not use docker-compose.local.yml?**  
A: That runs source code, not built images. This tests actual Docker images.

**Q: Can I use real AWS DynamoDB?**  
A: Yes! Your AWS credentials are mounted. Services use real DynamoDB by default.

**Q: How do I test without AWS?**  
A: Uncomment the `dynamodb-local` service in `docker-compose.test.yml`.

**Q: Do I need to rebuild every time?**  
A: Only when you change code. Environment variable changes don't need rebuild.

**Q: Can I test just one service?**  
A: Yes: `docker-compose -f docker-compose.test.yml up product-service`

---

**You're now ready to test your Docker images locally! 🎉**

