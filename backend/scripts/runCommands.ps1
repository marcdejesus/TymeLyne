# PowerShell script to run multiple commands in sequence
# This works around the limitation of PowerShell not supporting && for command chaining

param (
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$Command = ""
)

# Set working directory to the TymeLyne folder
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# If a specific command was provided as a parameter, run it
if ($Command -ne "") {
    Write-Host "Running command: $Command" -ForegroundColor Cyan
    Invoke-Expression $Command
    Exit $LASTEXITCODE
}

# Helper function to run a command and check for errors
function Invoke-CommandWithCheck {
    param([string]$CommandText)
    
    Write-Host "Running: $CommandText" -ForegroundColor Cyan
    Invoke-Expression $CommandText
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Command failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Exit $LASTEXITCODE
    }
}

# Example commands - use as needed
# Uncomment the ones you want to run

# Start the development server
# Invoke-CommandWithCheck "npm run dev"

# Fix user XP in the database
# Invoke-CommandWithCheck "node ./backend/scripts/fixProfileXp.js"

# List all users
# Invoke-CommandWithCheck "node ./backend/scripts/listUsers.js"

# Reset a user's XP (replace USER_ID with the actual user ID)
# Invoke-CommandWithCheck "node ./backend/scripts/resetUserXp.js USER_ID 0"

Write-Host "Script completed successfully" -ForegroundColor Green 