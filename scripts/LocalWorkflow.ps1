# LocalWorkflow.ps1
# Runs Install, Lint, Format, and Start scripts in order, exits with error message if any step fails

$steps = @(
    @{ Name = "Install"; Script = "Install.ps1" },
    @{ Name = "Lint"; Script = "Lint.ps1" },
    @{ Name = "Format"; Script = "Format.ps1" },
    @{ Name = "Start"; Script = "Start.ps1" }
)

foreach ($step in $steps) {
    Write-Host "Running $($step.Name)..."
    $scriptPath = Join-Path $PSScriptRoot $step.Script
    if ($step.Name -eq "Start") {
        Write-Host "Starting development server in a new PowerShell window..."
        $startScript = Join-Path $PSScriptRoot $step.Script
        Start-Process powershell.exe -ArgumentList "-Command", "& '$startScript'" -WindowStyle Normal
        Write-Host "Development server started in a new window. Close that window to stop the server."
        # Open the default browser to the local dev server URL
        $devUrl = "http://localhost:5173/"
        Start-Process $devUrl
    } else {
        Write-Host "Running $($step.Name) (live output)..."
        & $scriptPath
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Step '$($step.Name)' failed. Exiting workflow."
            exit $LASTEXITCODE
        }
    }
}

Write-Host "Local workflow completed successfully."
