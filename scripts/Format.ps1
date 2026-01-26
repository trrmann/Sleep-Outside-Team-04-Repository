<#
.SYNOPSIS
    Formats code using Prettier.

.DESCRIPTION
    Wrapper script that runs 'npm run format' from the project root.
    Uses Prettier to automatically format:
    - HTML files
    - JSON files
    - JavaScript files
    - TypeScript files
    - CSS files
    
    Configuration from .prettierrc applies consistent style.
    Respects .gitignore to avoid formatting node_modules, dist, etc.
    
    Automatically changes to project root directory before running.
    Returns to original directory after completion.

.PARAMETER Args
    Optional additional arguments to pass to npm run format.

.EXAMPLE
    .\Run.ps1 Format.ps1
    Formats all files in the project.

.NOTES
    Exit Code: Passes through Prettier exit code
    
    Called automatically by LocalWorkflow and RemoteWorkflow.
    Modifies files in place - commit changes after running.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

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
