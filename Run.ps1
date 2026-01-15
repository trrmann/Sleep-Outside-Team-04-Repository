# Run.ps1
# Usage: .\Run.ps1 <ScriptName.ps1> [args]
# Runs a PowerShell script from the scripts folder with any additional arguments

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
