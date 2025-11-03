#!/bin/bash

# Build and push Docker images to ECR
# Usage: ./docker/build-and-push.sh [service-name]
# If no service specified, builds all services

set -e

AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Error: AWS_ACCOUNT_ID environment variable is required"
  exit 1
fi

ECR_BASE_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Services to build
SERVICES=("product-service" "order-service" "auth-service" "payment-service" "email-service")

build_and_push_service() {
  local SERVICE=$1
  local IMAGE_NAME="${ECR_BASE_URL}/${SERVICE}:latest"
  
  echo "Building ${SERVICE}..."
  docker build -t ${SERVICE}:latest -f apps/${SERVICE}/Dockerfile .
  
  echo "Tagging ${SERVICE}..."
  docker tag ${SERVICE}:latest ${IMAGE_NAME}
  
  echo "Pushing ${SERVICE} to ECR..."
  docker push ${IMAGE_NAME}
  
  echo "✅ ${SERVICE} pushed to ${IMAGE_NAME}"
}

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_BASE_URL}

# Build specific service or all services
if [ -n "$1" ]; then
  if [[ " ${SERVICES[@]} " =~ " ${1} " ]]; then
    build_and_push_service $1
  else
    echo "Error: Unknown service $1"
    echo "Available services: ${SERVICES[@]}"
    exit 1
  fi
else
  echo "Building all services..."
  for SERVICE in "${SERVICES[@]}"; do
    build_and_push_service $SERVICE
  done
  echo "✅ All services built and pushed to ECR"
fi

