#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
fi

# Run tests with coverage
echo "Running Django tests with coverage..."
coverage run --source='.' manage.py test
coverage report

# Run connectivity tests separately (optional)
echo -e "\nRunning API connectivity tests..."
python api/connectivity_tests.py

echo -e "\nDone!" 