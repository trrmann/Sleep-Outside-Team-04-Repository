<#
.SYNOPSIS
    Builds production-ready files.

.DESCRIPTION
    Wrapper script that runs 'npm run build' from the project root.
    Uses Vite to build optimized production files:
    - Bundles and minifies JavaScript
    - Processes and minifies CSS
    - Optimizes assets
    - Generates source maps
    - Outputs to /dist directory
    
    Build includes:
    - Code splitting for better performance
    - Tree shaking to remove unused code
    - Asset hashing for cache busting
    - Production environment variables
    
    Automatically changes to project root directory before running.
    Returns to original directory after completion.

.PARAMETER Args
    Optional additional arguments to pass to npm run build.

.EXAMPLE
    .\Run.ps1 Build.ps1
    Builds production files to /dist.

.NOTES
    Exit Code: 0 if build succeeds, 1 if build fails
    
    Called automatically by RemoteWorkflow.
    Output: /dist directory (gitignored)
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Running: npm run build $Args"
npm run build @Args

$exitCode = $LASTEXITCODE
Pop-Location
exit $exitCode
