# Preview.ps1
# Wrapper script to run 'npm run preview' from the project root

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
