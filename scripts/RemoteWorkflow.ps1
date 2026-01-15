# RemoteWorkflow.ps1
# Runs Install, Lint, Format, Build, Preview, Commit, and Push scripts in order for remote deployment

$steps = @(
    @{ Name = "Install"; Script = "Install.ps1" },
    @{ Name = "Lint"; Script = "Lint.ps1" },
    @{ Name = "Format"; Script = "Format.ps1" },
    @{ Name = "Build"; Script = "Build.ps1" },
    @{ Name = "Preview"; Script = "Preview.ps1" }
)

foreach ($step in $steps) {
    Write-Host "Running $($step.Name) (live output)..."
    $scriptPath = Join-Path $PSScriptRoot $step.Script
    & $scriptPath
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Step '$($step.Name)' failed. Exiting workflow."
        exit $LASTEXITCODE
    }
    if ($step.Name -eq "Preview") {
        Write-Host "Preview completed. You may close the preview window."
    }
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
