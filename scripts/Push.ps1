<#
.SYNOPSIS
    Pushes commits to remote repository and opens deployment pages.

.DESCRIPTION
    Pushes all committed changes to the current git remote branch.
    On successful push, automatically opens:
    1. Render dashboard to monitor deployment
    2. Production site to verify deployment
    
    Deployment triggers automatically on push to main branch.
    Render will:
    - Pull latest code
    - Run npm install
    - Run npm run build
    - Restart with npm run serve (Express proxy)
    
    Typical deployment time: 2-3 minutes

.EXAMPLE
    .\Run.ps1 Push.ps1
    Pushes commits and opens deployment pages.

.NOTES
    Exit Code: 0 if push succeeds, 1 if push fails
    
    URLs Opened:
    - Dashboard: https://dashboard.render.com/static/srv-d5ff83ur433s73av55p0
    - Production: https://sleep-outside-team-04-repository.onrender.com/
    
    Called automatically by RemoteWorkflow after commit.
    Ensure commits are tested locally before pushing.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

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
