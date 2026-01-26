<#
.SYNOPSIS
    Complete local development workflow with validation.

.DESCRIPTION
    Executes the full local development workflow:
    1. Validates development environment configuration
    2. Checks port 5173 availability for Vite dev server
    3. Installs npm dependencies
    4. Runs ESLint to check for code errors
    5. Runs Prettier to format code
    6. Starts Vite development server
    7. Opens browser when server is confirmed running

    The workflow includes automatic validation and will:
    - Verify .env.development exists with required variables
    - Detect port conflicts and offer to kill blocking processes
    - Wait for server startup before opening browser
    - Exit immediately if any step fails

.EXAMPLE
    .\Run.ps1 LocalWorkflow.ps1
    Runs the complete local development workflow.

.NOTES
    Exit Code 0: Success - all steps completed
    Exit Code 1: Failure - validation or step failed
    
    The dev server runs in a separate window. Close it to stop the server.
    Browser opens automatically at http://localhost:5173/
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

# Pre-validation: Check environment configuration
Write-Host "Validating environment configuration..." -ForegroundColor Cyan
$validateScript = Join-Path $PSScriptRoot "ValidateEnvironment.ps1"
& $validateScript -Environment "development"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Environment validation failed. Please fix the issues and try again."
    exit 1
}

# Pre-validation: Check port availability for dev server
Write-Host "Checking port availability for development server..." -ForegroundColor Cyan
$validatePortScript = Join-Path $PSScriptRoot "ValidatePort.ps1"
& $validatePortScript -Port 5173 -ServiceName "Vite Development Server"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Port 5173 validation failed. Cannot start development server."
    exit 1
}

$steps = @(
    @{ Name = "Install"; Script = "Install.ps1" },
    @{ Name = "Lint"; Script = "Lint.ps1" },
    @{ Name = "Format"; Script = "Format.ps1" },
    @{ Name = "Start"; Script = "Start.ps1" }
)

foreach ($step in $steps) {
    Write-Host "Running $($step.Name)..."
    $scriptPath = Join-Path $PSScriptRoot $step.Script
    if ($step.Name -eq "Start") {
        Write-Host "Starting development server in a new PowerShell window..."
        $startScript = Join-Path $PSScriptRoot $step.Script
        Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "& '$startScript'" -WindowStyle Normal
        
        # Wait for server to start and verify it's running
        Write-Host "Waiting for development server to start..."
        $maxAttempts = 30
        $attempt = 0
        $serverRunning = $false
        $devUrl = "http://localhost:5173/"
        
        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 1
            $attempt++
            
            try {
                $connection = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
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
            Write-Host "`n[PASS] Development server is running on port 5173" -ForegroundColor Green
            Write-Host "Opening browser to $devUrl..."
            Start-Process $devUrl
            Write-Host "Server started successfully. Close the server window to stop it."
        } else {
            Write-Host "`n[FAIL] Development server failed to start within 30 seconds" -ForegroundColor Red
            Write-Host "Please check the server window for error messages."
            Write-Error "Server startup failed. Exiting workflow."
            exit 1
        }
    } else {
        Write-Host "Running $($step.Name) (live output)..."
        & $scriptPath
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Step '$($step.Name)' failed. Exiting workflow."
            exit $LASTEXITCODE
        }
    }
}

Write-Host "Local workflow completed successfully."
