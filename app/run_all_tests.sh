#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      Tymelyne Test Suite              ${NC}"
echo -e "${BLUE}========================================${NC}"

# Run backend tests
echo -e "\n${YELLOW}Running backend tests...${NC}"
cd backend
if [ -d "venv" ]; then
  source venv/bin/activate
fi
coverage run --source='.' manage.py test
BACKEND_RESULT=$?
coverage report

# Run frontend tests
echo -e "\n${YELLOW}Running frontend tests...${NC}"
cd ../frontend
npm test
FRONTEND_RESULT=$?

# Return to the root directory
cd ..

# Show summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}      Test Results Summary             ${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $BACKEND_RESULT -eq 0 ]; then
  echo -e "${GREEN}Backend tests: PASSED${NC}"
else
  echo -e "${RED}Backend tests: FAILED${NC}"
fi

if [ $FRONTEND_RESULT -eq 0 ]; then
  echo -e "${GREEN}Frontend tests: PASSED${NC}"
else
  echo -e "${RED}Frontend tests: FAILED${NC}"
fi

echo -e "${BLUE}========================================${NC}"

# Return exit code based on tests
if [ $BACKEND_RESULT -eq 0 ] && [ $FRONTEND_RESULT -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Please review the output above.${NC}"
  exit 1
fi 