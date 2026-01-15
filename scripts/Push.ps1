# Push.ps1
# Pushes committed changes to the current git remote and branch

Write-Host "Pushing changes to remote..."
git push
$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) {
    Write-Host "Push successful."
    # Open Render deploy page and end site in default browser
    $renderDeployUrl = "https://dashboard.render.com/static/srv-d5ff83ur433s73av55p0"
    $renderSiteUrl = "https://sleep-outside-team-04-repository.onrender.com/"
    Start-Process $renderDeployUrl
    Start-Process $renderSiteUrl
} else {
    Write-Error "Push failed."
}
exit $exitCode
