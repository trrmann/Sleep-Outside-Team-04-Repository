<#
.SYNOPSIS
    Previews production build locally.

.DESCRIPTION
    Wrapper script that runs 'npm run preview' from the project root.
    Serves the production build from /dist directory using Vite preview server.
    
    Preview server features:
    - Serves built files (must run Build.ps1 first)
    - Simulates production environment
    - Runs on http://localhost:4173
    - Uses production environment variables
    
    Opens new PowerShell window with preview server.
    Automatically opens default browser to http://localhost:4173.
    Close the PowerShell window to stop the server.

.PARAMETER Args
    Optional additional arguments to pass to npm run preview.

.EXAMPLE
    .\Run.ps1 Build.ps1
    .\Run.ps1 Preview.ps1
    Builds and previews production files.

.EXAMPLE
    .\Preview.ps1
    Direct execution to preview existing build.

.NOTES
    Port: 4173 (Vite preview default)
    Window Style: Normal (stays open)
    
    Prerequisites: Must run Build.ps1 first to generate /dist
    If /dist is missing, preview will fail.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Starting preview server in a new PowerShell window..."
   # Start preview server in a new PowerShell window
   Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "npm run preview" -WindowStyle Normal
   Write-Host "Preview server started in a new window. Close that window to stop the server."
    # Open the default browser to the preview site
    $previewUrl = "http://localhost:4173/"
    Start-Process $previewUrl
Pop-Location
