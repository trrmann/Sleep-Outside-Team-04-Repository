<#
.SYNOPSIS
    Runs ESLint to check code for errors and style issues.

.DESCRIPTION
    Wrapper script that runs 'npm run lint' from the project root.
    Uses ESLint to check JavaScript files for:
    - Syntax errors
    - Code quality issues
    - Style violations
    - Potential bugs
    
    Configuration from .eslintrc.json includes:
    - Prettier integration
    - Import plugin rules
    - Custom project rules
    
    Automatically changes to project root directory before running.
    Returns to original directory after completion.

.PARAMETER Args
    Optional additional arguments to pass to npm run lint.

.EXAMPLE
    .\Run.ps1 Lint.ps1
    Runs ESLint on all JavaScript files.

.NOTES
    Exit Code: 0 if no errors, 1 if errors found
    Warnings do not cause failure (exit code 0)
    
    Called automatically by LocalWorkflow and RemoteWorkflow.
    Lints: *.js and src/**/*.js
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

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
