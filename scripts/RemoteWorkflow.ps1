<#
.SYNOPSIS
    Complete remote deployment workflow with production testing.

.DESCRIPTION
    Executes the full deployment workflow:
    1. Validates production environment configuration
    2. Installs npm dependencies
    3. Runs ESLint to check for code errors
    4. Runs Prettier to format code
    5. Builds production files to /dist
    6. Checks port 3000 availability for proxy server
    7. Starts production proxy server for testing
    8. Opens browser when server is confirmed running
    9. Prompts for testing confirmation
    10. Commits changes to git
    11. Pushes to GitHub (triggers Render deployment)

    The workflow includes automatic validation and will:
    - Verify .env.production exists with required variables
    - Detect port conflicts and offer to kill blocking processes
    - Wait for server startup before opening browser
    - Allow manual testing before commit
    - Exit if any step fails or user cancels

.EXAMPLE
    .\Run.ps1 RemoteWorkflow.ps1
    Runs the complete deployment workflow.

.NOTES
    Exit Code 0: Success - deployed to GitHub/Render
    Exit Code 1: Failure - validation, build, or deployment failed
    
    Test server runs at http://localhost:3000/
    After push, Render auto-deploys from GitHub.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

# Pre-validation: Check production environment configuration
Write-Host "Validating production environment configuration..." -ForegroundColor Cyan
$validateScript = Join-Path $PSScriptRoot "ValidateEnvironment.ps1"
& $validateScript -Environment "production"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Production environment validation failed. Please fix the issues and try again."
    exit 1
}

$steps = @(
    @{ Name = "Install"; Script = "Install.ps1" },
    @{ Name = "Lint"; Script = "Lint.ps1" },
    @{ Name = "Format"; Script = "Format.ps1" },
    @{ Name = "Build"; Script = "Build.ps1" }
)

foreach ($step in $steps) {
    Write-Host "Running $($step.Name) (live output)..."
    $scriptPath = Join-Path $PSScriptRoot $step.Script
    & $scriptPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Step '$($step.Name)' failed. Exiting workflow."
        exit $LASTEXITCODE
    }
}

# Pre-validation: Check port availability for production proxy server
Write-Host "`nChecking port availability for production proxy server..." -ForegroundColor Cyan
$validatePortScript = Join-Path $PSScriptRoot "ValidatePort.ps1"
& $validatePortScript -Port 3000 -ServiceName "Production Proxy Server"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Port 3000 validation failed. Cannot start production proxy server."
    exit 1
}

# Test production proxy server
Write-Host "`nTesting production proxy server..."
Write-Host "Starting proxy server in a new PowerShell window..."
$projectRoot = $PSScriptRoot | Split-Path -Parent
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run serve" -WindowStyle Normal

# Wait for server to start and verify it's running
Write-Host "Waiting for proxy server to start..."
$maxAttempts = 30
$attempt = 0
$serverRunning = $false
$testUrl = "http://localhost:3000"

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempt++
    
    try {
        $connection = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
        if ($connection) {
            # Port is listening, give it another second to fully initialize
            Start-Sleep -Seconds 1
            $serverRunning = $true
            break
        }
    } catch {
        # Continue waiting
    }
    
    Write-Host "  Attempt $attempt/$maxAttempts..." -NoNewline
    Write-Host "`r" -NoNewline
}

if ($serverRunning) {
    Write-Host "`n[PASS] Production proxy server is running on port 3000" -ForegroundColor Green
    Write-Host "Opening browser to $testUrl for testing..."
    Start-Process $testUrl
} else {
    Write-Host "`n[FAIL] Production proxy server failed to start within 30 seconds" -ForegroundColor Red
    Write-Host "Please check the server window for error messages."
    Write-Error "Server startup failed. Exiting workflow."
    exit 1
}

Write-Host "`nTest the application, then close the server window when done."
$continue = Read-Host "Press Enter when ready to commit and push (or type 'exit' to cancel)"
if ($continue -eq "exit") {
    Write-Host "Workflow cancelled."
    exit 0
}

# Check if there are any changes to commit
Write-Host "`nChecking for changes to commit..."
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "[INFO] No changes to commit. Workflow completed successfully." -ForegroundColor Yellow
    Write-Host "Exiting in 5 seconds..."
    Start-Sleep -Seconds 5
    exit 0
}

# Commit step
$commitScript = Join-Path $PSScriptRoot "Commit.ps1"
$commitMsg = Read-Host "Enter commit message (leave blank to exit)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    Write-Host "No commit message provided. Exiting workflow."
    exit 0
}
& $commitScript -Message $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Error "Commit step failed. Exiting workflow."
    exit $LASTEXITCODE
}

# Push step
$pushScript = Join-Path $PSScriptRoot "Push.ps1"
& $pushScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "Push step failed. Exiting workflow."
    exit $LASTEXITCODE
}

Write-Host "Remote workflow completed successfully."
Write-Host "Changes pushed to GitHub. Render will auto-deploy with proxy server."
