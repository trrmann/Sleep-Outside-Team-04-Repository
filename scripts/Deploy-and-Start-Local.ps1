
# Step 1: Install dependencies
Write-Host "Installing dependencies..."
$installResult = npm install
$installSuccess = $LASTEXITCODE -eq 0
if (-not $installSuccess) {
  Write-Error "npm install failed."
  Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
  Read-Host
  return
}

# Step 2: Lint
Write-Host "Running linter..."
$lintResult = npm run lint
$lintSuccess = $LASTEXITCODE -eq 0
if (-not $lintSuccess) {
  Write-Error "Linting failed."
  Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
  Read-Host
  return
}

# Step 3: Format
Write-Host "Formatting code..."
$formatResult = npm run format
$formatSuccess = $LASTEXITCODE -eq 0
if (-not $formatSuccess) {
  Write-Error "Formatting failed."
  Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
  Read-Host
  return
}

# Step 4: Start server and monitor
function Start-LocalServer {
  Write-Host "Starting local server..."
  $serverProcess = Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run start" -PassThru
  Start-Sleep -Seconds 3 # Wait for server to start
  return $serverProcess
}

$localUrl = "http://localhost:5173" # Change if your dev server uses a different port
$maxRetries = 1
$retryCount = 0
$serverStarted = $false
while (-not $serverStarted -and $retryCount -le $maxRetries) {
  $serverProcess = Start-LocalServer
  Start-Sleep -Seconds 2
  if ($serverProcess.HasExited) {
    $exitCode = $serverProcess.ExitCode
    $viteError = $null
    if (Test-Path .\node_modules\.vite\deps) {
      $viteError = Get-ChildItem .\node_modules\.vite\deps -Recurse | Select-String "EPERM: operation not permitted, rmdir" -ErrorAction SilentlyContinue
    }
    if ($viteError) {
      try {
        $folderPath = (Resolve-Path .\node_modules\.vite\deps).Path
      } catch {
        $folderPath = ".\\node_modules\\.vite\\deps"
      }
      $message = "Failed to delete folder due to permissions: $folderPath`nPlease close any programs using this folder and delete it manually."
      try {
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show($message, "Manual Folder Deletion Required", 'OK', 'Error') | Out-Null
      } catch {
        Write-Host "Popup failed."
      }
      Write-Host $message
      Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
      Read-Host
      return
    } else {
      Write-Host "Server failed to start (exit code $exitCode)."
      Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
      Read-Host
      return
    }
  } else {
    # Check if server responds
    try {
      $response = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -eq 200) {
        $serverStarted = $true
        Write-Host "Server started successfully. Opening $localUrl in default browser..."
        Start-Process $localUrl
      } else {
        Write-Host "Server did not respond with 200 OK."
        Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
        Read-Host
        return
      }
    } catch {
      Write-Host "Server not responding at $localUrl."
      Write-Host "The terminal will remain open. Press Enter to continue after you have read the instructions."
      Read-Host
      return
    }
  }
}

# Step 6: Monitor server and handle user break
function Test-Server {
  param([string]$url)
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

Write-Host "Monitoring server. Press Ctrl+C to stop."
try {
  while ($true) {
    if ($serverProcess.HasExited) {
      Write-Host "Server process exited."
      break
    }
    if (-not (Test-Server $localUrl)) {
      Write-Host "Server not responding at $localUrl."
    }
    Start-Sleep -Seconds 2
  }
}
catch {
  Write-Host "Script interrupted by user. Killing server process..."
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "Server process killed."
  }
  # Additional cleanup for residual issues
  Write-Host "Performing additional cleanup..."
  # Kill any lingering node/vite processes
  Get-Process node,vite -ErrorAction SilentlyContinue | ForEach-Object { $_.Kill() }
  # Release common dev ports (e.g., 3000, 5173)
  $ports = @(3000, 5173)
  foreach ($port in $ports) {
    $netstat = netstat -ano | Select-String ":$port"
    foreach ($line in $netstat) {
      $pid = ($line -split '\s+')[-1]
      if ($pid -match '^\d+$') {
        try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
      }
    }
  }
  # Reset environment variables if set
  Remove-Item Env:VITE_* -ErrorAction SilentlyContinue
  Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
  # Clear the terminal screen
  Clear-Host
  Write-Host "Cleanup complete."
  exit 0
}
finally {
  Write-Host "Final cleanup after script exit..."
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }
  Get-Process node,vite -ErrorAction SilentlyContinue | ForEach-Object { $_.Kill() }
  $ports = @(3000, 5173)
  foreach ($port in $ports) {
    $netstat = netstat -ano | Select-String ":$port"
    foreach ($line in $netstat) {
      $pid = ($line -split '\s+')[-1]
      if ($pid -match '^\d+$') {
        try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
      }
    }
  }
  Remove-Item Env:VITE_* -ErrorAction SilentlyContinue
  Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
  Clear-Host
  Write-Host "Final cleanup complete."
}
