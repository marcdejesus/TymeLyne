#!/bin/bash
set -e

echo "Django server starting..."

# Print debug info
echo "=== Environment ==="
echo "DJANGO_ALLOWED_HOSTS: $DJANGO_ALLOWED_HOSTS"
echo "CORS settings:"
echo "CORS_ORIGIN_WHITELIST: $CORS_ORIGIN_WHITELIST"
echo "CORS_ALLOW_ALL_ORIGINS: $CORS_ALLOW_ALL_ORIGINS"
echo "STATIC_ROOT: $STATIC_ROOT"
echo "===================="

# Create static directory if it doesn't exist
echo "Preparing static files directory..."
mkdir -p $STATIC_ROOT

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput || true
echo "Migrations complete"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Static files collection skipped"
echo "Static files processing complete"

# Create superuser if not exists
echo "Checking for superuser..."
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
    print('Superuser created')
else:
    print('Superuser already exists')
" || true

# Start the Django server
echo "Starting Django server with CORS enabled..."
echo "Listening on all interfaces (0.0.0.0) at port 8000"

# Run the server
exec python manage.py runserver 0.0.0.0:8000 