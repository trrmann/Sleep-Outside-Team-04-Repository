# Commit.ps1
# Commits staged changes to git with a provided message

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
