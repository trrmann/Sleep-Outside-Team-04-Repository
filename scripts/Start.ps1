# Start.ps1
# Wrapper script to run 'npm run start' from the project root


param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Starting development server..."


Start-Process "npm" -ArgumentList @("run", "start") -WindowStyle Normal

Write-Host "Development server started in a new window."
Write-Host "Check dev-server.log for output and errors if the window closes unexpectedly."
Pop-Location
