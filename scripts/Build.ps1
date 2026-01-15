# Build.ps1
# Wrapper script to run 'npm run build' from the project root

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
