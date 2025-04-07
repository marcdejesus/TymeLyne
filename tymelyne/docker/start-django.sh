#!/bin/sh

echo "Starting Django server..."

# Ensure migrations are up to date - continue even if errors
echo "Running migrations..."
python manage.py makemigrations || echo "Makemigrations had issues, but continuing..."
python manage.py migrate || echo "Migration had issues, but continuing..."

# Print CORS settings for debugging
echo "CORS settings:"
if [ -n "$CORS_ORIGIN_WHITELIST" ]; then
  echo "CORS_ORIGIN_WHITELIST=$CORS_ORIGIN_WHITELIST"
else
  echo "CORS_ORIGIN_WHITELIST not set, using default"
fi

# Check if we can access the admin page (basic health check)
echo "Testing Django health..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ || echo "Admin page not yet available, starting server anyway"

echo "Starting Django server with CORS enabled..."
python manage.py runserver 0.0.0.0:8000 