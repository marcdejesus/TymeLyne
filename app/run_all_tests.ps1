# PowerShell script to run all tests

# Define colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Blue "========================================"
Write-ColorOutput Blue "      Tymelyne Test Suite              "
Write-ColorOutput Blue "========================================"

# Install backend dependencies
Write-ColorOutput Yellow "`nInstalling backend dependencies..."
$currentDir = Get-Location
Set-Location -Path "backend"
pip install -r requirements.txt
# Ensure core packages are installed
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pytest pytest-django coverage requests

# Run backend tests
Write-ColorOutput Yellow "`nRunning backend tests..."
python manage.py test
$BACKEND_RESULT = $LASTEXITCODE

# Return to app directory
Set-Location -Path $currentDir

# Install frontend dependencies
Write-ColorOutput Yellow "`nInstalling frontend dependencies..."
Set-Location -Path "frontend"
npm install --save-dev jest jest-expo @testing-library/jest-native @testing-library/react-native react-test-renderer

# Run frontend tests
Write-ColorOutput Yellow "`nRunning frontend tests..."
npx jest --config=jest.config.js --watchAll=false
$FRONTEND_RESULT = $LASTEXITCODE

# Return to app directory
Set-Location -Path $currentDir

# Show summary
Write-ColorOutput Blue "`n========================================"
Write-ColorOutput Blue "      Test Results Summary             "
Write-ColorOutput Blue "========================================"

if ($BACKEND_RESULT -eq 0) {
    Write-ColorOutput Green "Backend tests: PASSED"
} else {
    Write-ColorOutput Red "Backend tests: FAILED"
}

if ($FRONTEND_RESULT -eq 0) {
    Write-ColorOutput Green "Frontend tests: PASSED"
} else {
    Write-ColorOutput Red "Frontend tests: FAILED"
}

Write-ColorOutput Blue "========================================"

# Return exit code based on tests
if (($BACKEND_RESULT -eq 0) -and ($FRONTEND_RESULT -eq 0)) {
    Write-ColorOutput Green "All tests passed successfully!"
    exit 0
} else {
    Write-ColorOutput Red "Some tests failed. Please review the output above."
    exit 1
} 