<#
.SYNOPSIS
    Starts Vite development server in a new window.

.DESCRIPTION
    Wrapper script that runs 'npm run start' from the project root.
    Opens a new PowerShell window with the Vite dev server running.
    
    Server features:
    - Hot Module Replacement (HMR) for instant updates
    - Fast refresh for React components
    - Source maps for debugging
    - Proxy configuration for /api/* routes
    - Runs on http://localhost:5173
    
    Window stays open with -NoExit flag.
    Close the PowerShell window to stop the server.
    
    Automatically changes to project root directory before running.

.PARAMETER Args
    Optional additional arguments to pass to npm run start.

.EXAMPLE
    .\Run.ps1 Start.ps1
    Starts dev server in new window on port 5173.

.NOTES
    Port: 5173 (Vite default)
    Window Style: Normal (stays open)
    
    Called automatically by LocalWorkflow.
    If port 5173 is in use, ValidatePort will prompt to kill the process.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>


param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Starting development server..."


Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run start" -WindowStyle Normal

Write-Host "Development server started in a new window."
Write-Host "Close the PowerShell window to stop the server."
Pop-Location
