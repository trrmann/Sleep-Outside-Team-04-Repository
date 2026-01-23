# Start.ps1
# Wrapper script to run 'npm run start' from the project root


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
