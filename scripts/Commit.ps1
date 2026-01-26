<#
.SYNOPSIS
    Commits all changes to git with a provided message.

.DESCRIPTION
    Stages all changes (git add -A) and commits with the provided message.
    
    Process:
    1. Stages all modified, deleted, and new files
    2. Checks if there are changes to commit
    3. Creates commit with provided message
    4. Reports success or failure
    
    Exits gracefully (code 0) if no changes to commit.
    Useful for ensuring clean state before push.

.PARAMETER Message
    Required commit message describing the changes.
    Should follow team conventions:
    - Start with verb (Add, Fix, Update, Remove)
    - Be descriptive but concise
    - Reference issue numbers if applicable

.EXAMPLE
    .\Run.ps1 Commit.ps1 "Fix cart total calculation"
    Commits all changes with the specified message.

.EXAMPLE
    .\Commit.ps1 "Add proxy configuration for production"
    Direct execution with commit message.

.NOTES
    Exit Code: 0 if successful or nothing to commit, 1 if commit fails
    
    Called automatically by RemoteWorkflow after successful testing.
    Stages ALL changes - use git status first if unsure.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Message
)

Write-Host "Staging all changes..."
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit. Exiting gracefully."
    exit 0
}
Write-Host "Committing changes with message: $Message"
git commit -m "$Message"
$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) {
    Write-Host "Commit successful."
} else {
    Write-Error "Commit failed."
}
exit $exitCode
