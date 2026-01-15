# Format.ps1
# Wrapper script to run 'npm run format' from the project root

param(
  [Parameter(ValueFromRemainingArguments = $true)]
  $Args
)

$projectRoot = $PSScriptRoot | Split-Path -Parent
Push-Location $projectRoot

Write-Host "Running: npm run format $Args"
npm run format @Args

$exitCode = $LASTEXITCODE
Pop-Location
exit $exitCode
