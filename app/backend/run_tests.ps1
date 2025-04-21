# PowerShell script to run backend tests

Write-Host "Installing required Django packages..." -ForegroundColor Yellow

# Install necessary dependencies - ensure djangorestframework is installed
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pytest pytest-django coverage requests

Write-Host "Running Django Tests with Coverage..." -ForegroundColor Yellow

# Run Django tests
python manage.py test
$BACKEND_RESULT = $LASTEXITCODE

# Check the exit code
if ($BACKEND_RESULT -eq 0) {
    Write-Host "Backend Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "Backend Tests: FAILED" -ForegroundColor Red
}

Write-Host "Running API Connectivity Tests..." -ForegroundColor Yellow

# Run connectivity tests
python api/connectivity_tests.py
$CONNECTIVITY_RESULT = $LASTEXITCODE

# Check the exit code
if ($CONNECTIVITY_RESULT -eq 0) {
    Write-Host "Connectivity Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "Connectivity Tests: FAILED" -ForegroundColor Red
}

Write-Host "Tests completed." 