# RemoteWorkflow.ps1
# Runs Install, Lint, Format, Build, and tests production proxy server before commit/push

$steps = @(
    @{ Name = "Install"; Script = "Install.ps1" },
    @{ Name = "Lint"; Script = "Lint.ps1" },
    @{ Name = "Format"; Script = "Format.ps1" },
    @{ Name = "Build"; Script = "Build.ps1" }
)

foreach ($step in $steps) {
    Write-Host "Running $($step.Name) (live output)..."
    $scriptPath = Join-Path $PSScriptRoot $step.Script
    & $scriptPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Step '$($step.Name)' failed. Exiting workflow."
        exit $LASTEXITCODE
    }
}

# Test production proxy server
Write-Host "`nTesting production proxy server..."
Write-Host "Starting proxy server in a new PowerShell window..."
$projectRoot = $PSScriptRoot | Split-Path -Parent
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run serve" -WindowStyle Normal

Write-Host "Proxy server started on http://localhost:3000"
Write-Host "Opening browser for testing..."
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "`nTest the application, then close the server window when done."
$continue = Read-Host "Press Enter when ready to commit and push (or type 'exit' to cancel)"
if ($continue -eq "exit") {
    Write-Host "Workflow cancelled."
    exit 0
}

# Commit step
$commitScript = Join-Path $PSScriptRoot "Commit.ps1"
$commitMsg = Read-Host "Enter commit message (leave blank to exit)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    Write-Host "No commit message provided. Exiting workflow."
    exit 0
}
& $commitScript -Message $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Error "Commit step failed. Exiting workflow."
    exit $LASTEXITCODE
}

# Push step
$pushScript = Join-Path $PSScriptRoot "Push.ps1"
& $pushScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "Push step failed. Exiting workflow."
    exit $LASTEXITCODE
}

Write-Host "Remote workflow completed successfully."
Write-Host "Changes pushed to GitHub. Render will auto-deploy with proxy server."
