# Install.ps1
# Wrapper script to run 'npm install' from the project root

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Running: npm install $Args"
npm install @Args

$exitCode = $LASTEXITCODE
Pop-Location
exit $exitCode
