<#
.SYNOPSIS
    Installs npm dependencies for the project.

.DESCRIPTION
    Wrapper script that runs 'npm install' from the project root.
    Installs all dependencies listed in package.json including:
    - Production dependencies (express, http-proxy-middleware)
    - Development dependencies (vite, eslint, prettier, jest)
    
    Automatically changes to project root directory before running.
    Returns to original directory after completion.

.PARAMETER Args
    Optional additional arguments to pass to npm install.
    Examples: --force, --legacy-peer-deps

.EXAMPLE
    .\Run.ps1 Install.ps1
    Installs all npm dependencies.

.EXAMPLE
    .\Install.ps1 --force
    Installs dependencies with --force flag.

.NOTES
    Exit Code: Passes through npm install exit code
    
    Called automatically by LocalWorkflow and RemoteWorkflow.
    Run this manually if package.json changes.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

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
