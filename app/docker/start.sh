#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      Tymelyne Docker Startup          ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
  exit 1
fi

# Navigate to the project root
cd "$(dirname "$0")/.."

echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker-compose down

echo -e "${YELLOW}Starting containers...${NC}"

# Build each service separately to get better error messages
echo -e "${YELLOW}Building backend image...${NC}"
docker-compose build backend
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build backend container. See error above.${NC}"
  exit 1
fi

echo -e "${YELLOW}Building frontend image...${NC}"
docker-compose build frontend
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build frontend container. See error above.${NC}"
  exit 1
fi

# Start the backend first
echo -e "${YELLOW}Starting backend container...${NC}"
docker-compose up -d backend
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start backend container. See error above.${NC}"
  docker-compose logs backend
  exit 1
fi

# Wait a bit for backend to initialize
sleep 5

# Start the frontend
echo -e "${YELLOW}Starting frontend container...${NC}"
docker-compose up -d frontend
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start frontend container. See error above.${NC}"
  docker-compose logs frontend
  exit 1
fi

# Wait for containers to be ready
echo -e "${YELLOW}Waiting for containers to start...${NC}"
sleep 15

# Check if containers are running (more permissive check for frontend since Expo might take time)
if [ "$(docker ps | grep tymelyne-backend)" ]; then
  echo -e "${GREEN}Backend started successfully!${NC}"
  
  echo -e "${YELLOW}Frontend may take longer to start as it installs dependencies...${NC}"
  echo -e "${YELLOW}You can check progress with: docker-compose logs -f frontend${NC}"
  
  echo -e "${GREEN}================ ACCESS INFO =================${NC}"
  echo -e "${YELLOW}Backend API:${NC} http://localhost:8000"
  echo -e "${YELLOW}Frontend App:${NC} http://localhost:19000"
  echo -e "${GREEN}=============================================${NC}"
  
  echo -e "\n${BLUE}Container logs are available with:${NC}"
  echo -e "  ${YELLOW}docker-compose logs -f${NC}"
  
  echo -e "\n${BLUE}To stop containers:${NC}"
  echo -e "  ${YELLOW}docker-compose down${NC}"
  
  # Show logs to check for any errors
  echo -e "\n${YELLOW}Showing latest logs:${NC}"
  docker-compose logs --tail=30
else
  echo -e "${RED}Error: Backend container failed to start properly.${NC}"
  echo -e "${YELLOW}Checking logs...${NC}"
  docker-compose logs
  exit 1
fi 