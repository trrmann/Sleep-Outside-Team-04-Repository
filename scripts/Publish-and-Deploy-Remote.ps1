# Publish-and-Deploy-Remote.ps1
# This script performs all steps of local-deploy-and-start.ps1 except starting and monitoring the service.
# Logging setup
$logFile = "$(Split-Path -Parent $MyInvocation.MyCommand.Path)\publish-remote.log"
function Write-Log($msg) {
  Add-Content -Path $logFile -Value ("[$(Get-Date -Format o)] $msg")
}
Write-Log "Script started."

# Step 1: Install dependencies
Write-Host "Installing dependencies..."
$installResult = npm install
$installSuccess = $LASTEXITCODE -eq 0
if (-not $installSuccess) {
  Write-Error "npm install failed. Exiting."
  Write-Log "ERROR: npm install failed."
  exit 1
}

# Step 2: Lint
Write-Host "Running linter..."
$lintResult = npm run lint
$lintSuccess = $LASTEXITCODE -eq 0
if (-not $lintSuccess) {
  Write-Error "Linting failed. Exiting."
  Write-Log "ERROR: Linting failed."
  exit 1
}

# Step 3: Format
Write-Host "Formatting code..."
$formatResult = npm run format
$formatSuccess = $LASTEXITCODE -eq 0
if (-not $formatSuccess) {
  Write-Error "Formatting failed. Exiting."
  Write-Log "ERROR: Formatting failed."
  exit 1
}

# Step 4: Build (run if format is successful)
Write-Host "Running build..."
$buildResult = npm run build
$buildSuccess = $LASTEXITCODE -eq 0
if (-not $buildSuccess) {
  Write-Error "Build failed. Exiting."
  Write-Log "ERROR: Build failed."
  exit 1
}

# Step 4.5: Preview, open browser, monitor, cleanup
Write-Host "Starting Vite preview server in a new terminal window..."
$localUrl = "http://localhost:4173" # Default Vite preview port
Write-Host "Opening $localUrl in default browser..."
Write-Log "Step: npm run preview (new terminal)"
Write-Log "Opening browser: $localUrl"
Start-Process $localUrl
# Open preview in a new PowerShell window and track PID
$previewProcess = Start-Process -FilePath "pwsh.exe" -ArgumentList "-NoExit", "-Command", "npm run preview" -WindowStyle Normal -PassThru
Write-Host "A new terminal window has been opened for preview (PID: $($previewProcess.Id))."
Write-Log "Preview external terminal PID: $($previewProcess.Id)"
Write-Host "Press ENTER here to close the preview window and continue..."
Read-Host | Out-Null
# Close the external preview window
# Kill the external preview window and its child processes
if ($previewProcess -and -not $previewProcess.HasExited) {
  Write-Host "Closing external preview window and its child processes..."
  taskkill /PID $previewProcess.Id /T /F | Out-Null
  Write-Log "Closed external preview window and child processes (PID: $($previewProcess.Id))."
}
# Cleanup environment variables only
Remove-Item Env:VITE_* -ErrorAction SilentlyContinue
Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
Write-Host "Cleanup complete."
Write-Log "Cleanup complete."

# Step 5: Check for uncommitted git changes
Write-Host "Checking for uncommitted git changes..."
$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Host "There are uncommitted changes in the repository."
  Write-Host "Staging changes..."
  Write-Log "Step: git add ."
  git add .
  $commitMsg = Read-Host "Enter commit message"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
      Write-Host "No commit message entered. Exiting gracefully."
      Write-Log "No commit message entered. Exiting gracefully."
      exit 0
    }
    git commit -m "$commitMsg"
    Write-Log "Step: git commit -m $commitMsg"
    Write-Host "Changes committed with message: $commitMsg"
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Commit successful. Pushing to remote..."
      Write-Log "Step: git push"
      git push
      if ($LASTEXITCODE -eq 0) {
        Write-Host "Push to remote successful."
        Write-Log "Push to remote successful."
      } else {
        Write-Host "Push to remote failed. Please check your remote settings."
        Write-Log "Push to remote failed."
      }
    } else {
      Write-Host "Commit failed. Push will not be attempted."
      Write-Log "Commit failed. Push will not be attempted."
    }
} else {
  Write-Host "No uncommitted changes detected."
  Write-Log "No uncommitted changes detected."
}

Write-Host "Remote publish steps complete. Service not started or monitored."
Write-Log "Script completed."
