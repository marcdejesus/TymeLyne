#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Run Django server
python3 manage.py runserver 0.0.0.0:8000 