<#
.SYNOPSIS
    Main entry point for running workflow scripts.

.DESCRIPTION
    This script serves as a launcher for all workflow scripts in the scripts/ folder.
    It provides a consistent interface for running any script while handling errors
    and exit codes properly.

.PARAMETER ScriptName
    The name of the script to run (e.g., "LocalWorkflow.ps1", "RemoteWorkflow.ps1")
    Script must exist in the scripts/ folder.

.PARAMETER Args
    Optional additional arguments to pass to the script.

.EXAMPLE
    .\Run.ps1 LocalWorkflow.ps1
    Runs the local development workflow.

.EXAMPLE
    .\Run.ps1 RemoteWorkflow.ps1
    Runs the remote deployment workflow.

.EXAMPLE
    .\Run.ps1 Install.ps1
    Runs npm install.

.NOTES
    Exit Code: Passes through the exit code from the executed script.
    Author: Sleep Outside Team 04
    Version: 2.0
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptName,
    [Parameter(ValueFromRemainingArguments = $true)]
    $Args
)

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "scripts/$ScriptName"

if (-Not (Test-Path $scriptPath)) {
    Write-Error "Script '$ScriptName' not found in scripts folder."
    exit 1
}

Write-Host "Running $scriptPath $Args..."
& $scriptPath @Args
exit $LASTEXITCODE
