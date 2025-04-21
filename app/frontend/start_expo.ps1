# PowerShell script to start Expo on a specific port

# Start Expo on port 8084 (avoiding conflicts with Docker)
Write-Host "Starting Expo on port 8084..." -ForegroundColor Cyan
npx expo start --port 8084 