<#
.SYNOPSIS
    Validates environment configuration files and variables.

.DESCRIPTION
    Checks for required environment files and validates that all
    necessary environment variables are present. Works for both
    development and production environments.
    
    Development Mode:
    - Requires: src/.env.development
    - Checks: VITE_SERVER_URL key exists
    
    Production Mode:
    - Requires: src/.env.production
    - Checks: VITE_SERVER_URL key exists
    - Optional: src/.env.production.local with BACKEND_API_TOKEN
    
    Shows detailed error popup if validation fails.
    Never displays secret values, only confirms keys exist.

.PARAMETER Environment
    The environment to validate: 'development' or 'production'
    Default: development

.EXAMPLE
    .\ValidateEnvironment.ps1 -Environment development
    Validates development environment.

.EXAMPLE
    .\ValidateEnvironment.ps1 -Environment production
    Validates production environment.

.NOTES
    Exit Code 0: All required files and keys present
    Exit Code 1: Missing required files or keys
    
    Called automatically by LocalWorkflow and RemoteWorkflow.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "development"
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
$srcPath = Join-Path $projectRoot "src"

# Define required files and keys based on environment
$requiredFiles = @(
    @{ Path = Join-Path $srcPath ".env.$Environment"; Required = $true; Name = ".env.$Environment" },
    @{ Path = Join-Path $srcPath ".env"; Required = $false; Name = ".env (fallback)" }
)

# Base required keys for all environments
$requiredKeys = @("VITE_SERVER_URL")

# Additional checks for production environment
$optionalProductionFile = $null
$hasProductionLocalToken = $false
if ($Environment -eq "production") {
    $optionalProductionFile = Join-Path $srcPath ".env.production.local"
    if (Test-Path $optionalProductionFile) {
        $localContent = Get-Content $optionalProductionFile -Raw
        $hasProductionLocalToken = $localContent -match "^BACKEND_API_TOKEN\s*="
    }
}

# Track validation results
$missingFiles = @()
$missingKeys = @()
$warnings = @()
$allValid = $true

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Environment Configuration Validation ($Environment)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check for required files
Write-Host "Checking environment files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    $exists = Test-Path $file.Path
    $status = if ($exists) { "[PASS]" } else { "[FAIL]" }
    $color = if ($exists) { "Green" } else { "Red" }
    
    Write-Host "  $status $($file.Name)" -ForegroundColor $color
    
    if (-not $exists -and $file.Required) {
        $missingFiles += $file.Name
        $allValid = $false
    }
}

# Check optional production.local file for production environment
if ($Environment -eq "production") {
    $exists = Test-Path $optionalProductionFile
    $status = if ($exists) { "[PASS]" } else { "[WARN]" }
    $color = if ($exists) { "Green" } else { "Yellow" }
    
    Write-Host "  $status .env.production.local (optional for local testing)" -ForegroundColor $color
    
    if ($exists -and $hasProductionLocalToken) {
        Write-Host "    └─ Contains BACKEND_API_TOKEN for local proxy testing" -ForegroundColor Green
    } elseif ($exists) {
        Write-Host "    └─ File exists but missing BACKEND_API_TOKEN" -ForegroundColor Yellow
        $warnings += "Create BACKEND_API_TOKEN in .env.production.local for local testing"
    } else {
        $warnings += "Optional: Create src/.env.production.local with BACKEND_API_TOKEN for local proxy testing"
    }
}


# Check for required keys in environment files
Write-Host "`nChecking required environment variables..." -ForegroundColor Yellow

$envFileToCheck = $null
foreach ($file in $requiredFiles) {
    if (Test-Path $file.Path) {
        $envFileToCheck = $file.Path
        break
    }
}

if ($envFileToCheck) {
    $envContent = Get-Content $envFileToCheck -Raw
    
    foreach ($key in $requiredKeys) {
        $keyPattern = "(?m)^$key\s*="
        $found = $envContent -match $keyPattern
        $status = if ($found) { "[PASS]" } else { "[FAIL]" }
        $color = if ($found) { "Green" } else { "Red" }
        
        Write-Host "  $status $key" -ForegroundColor $color -NoNewline
        Write-Host " (value hidden for security)" -ForegroundColor Gray
        
        if (-not $found) {
            $missingKeys += $key
            $allValid = $false
        }
    }
} else {
    Write-Host "  [FAIL] No environment file found to validate keys" -ForegroundColor Red
    $allValid = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allValid) {
    Write-Host "Validation Result: PASSED" -ForegroundColor Green
    
    # Show warnings if any
    if ($warnings.Count -gt 0) {
        Write-Host "`nOptional Recommendations:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  [!] $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host "========================================`n" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "Validation Result: FAILED" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # Build error message for popup
    $errorMessage = "Environment Configuration Missing ($Environment):`n`n"
    
    if ($missingFiles.Count -gt 0) {
        $errorMessage += "Missing Files:`n"
        foreach ($file in $missingFiles) {
            $errorMessage += "  - $file`n"
        }
        $errorMessage += "`n"
    }
    
    if ($missingKeys.Count -gt 0) {
        $errorMessage += "Missing Keys:`n"
        foreach ($key in $missingKeys) {
            $errorMessage += "  - $key`n"
        }
        $errorMessage += "`n"
    }
    
    $errorMessage += "Required Setup:`n"
    $errorMessage += "  1. Ensure src/.env.$Environment exists`n"
    $errorMessage += "  2. Add required key: VITE_SERVER_URL=/api/`n"
    
    if ($Environment -eq "production") {
        $errorMessage += "`nOptional for Local Testing:`n"
        $errorMessage += "  - Create src/.env.production.local`n"
        $errorMessage += "  - Add: BACKEND_API_TOKEN=<your-token>`n"
    }
    
    $errorMessage += "`nSee TEAM_ENV_SETUP.md for detailed instructions."
    
    # Show popup window
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
        $errorMessage,
        "Environment Validation Failed - $Environment",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
    
    exit 1
}
