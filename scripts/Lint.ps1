# Lint.ps1
# Wrapper script to run 'npm run lint' from the project root

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Running: npm run lint $Args"
npm run lint @Args

$exitCode = $LASTEXITCODE
Pop-Location
exit $exitCode
