<#
.SYNOPSIS
    Validates port availability and resolves conflicts.

.DESCRIPTION
    Checks if a specified port is available. If the port is in use:
    1. Identifies the process using the port (name, PID, path)
    2. Shows popup asking user to kill the process
    3. Terminates the process if user approves
    4. Verifies the port was successfully freed
    5. Exits gracefully if port cannot be freed
    
    Handles all edge cases:
    - Process cannot be identified
    - User declines to kill process
    - Kill operation fails
    - New process takes over port immediately

.PARAMETER Port
    The port number to check (required).
    Example: 5173 for Vite, 3000 for Express

.PARAMETER ServiceName
    Friendly name of the service for display in messages.
    Default: "Service"

.EXAMPLE
    .\ValidatePort.ps1 -Port 5173 -ServiceName "Vite Development Server"
    Checks if port 5173 is available for Vite.

.EXAMPLE
    .\ValidatePort.ps1 -Port 3000 -ServiceName "Production Proxy Server"
    Checks if port 3000 is available for Express.

.NOTES
    Exit Code 0: Port is available
    Exit Code 1: Port in use and cannot be freed
    
    Shows interactive popups for user confirmation.
    Called automatically by LocalWorkflow and RemoteWorkflow.
    
    Author: Sleep Outside Team 04
    Version: 2.0
#>

param(
    [Parameter(Mandatory = $true)]
    [int]$Port,
    
    [Parameter(Mandatory = $false)]
    [string]$ServiceName = "Service"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Port Availability Check - Port $Port" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to check if port is in use
function Test-PortInUse {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to get process using the port
function Get-PortProcess {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        return $process
    }
    return $null
}

# Check if port is in use
if (-not (Test-PortInUse -Port $Port)) {
    Write-Host "[PASS] Port $Port is available" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    exit 0
}

# Port is in use - get the process
$process = Get-PortProcess -Port $Port
if ($null -eq $process) {
    Write-Host "[FAIL] Port $Port is in use but cannot identify the process" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
        "Port $Port is in use but the process cannot be identified.`n`nPlease manually stop the service using port $Port and try again.",
        "Port $Port In Use",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Warning
    ) | Out-Null
    
    exit 1
}

Write-Host "[!] Port $Port is in use" -ForegroundColor Yellow
Write-Host "    Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
Write-Host "    Path: $($process.Path)" -ForegroundColor Gray

# Ask user if they want to kill the process
Add-Type -AssemblyName System.Windows.Forms
$message = "Port $Port is currently in use by:`n`n"
$message += "Process: $($process.ProcessName) (PID: $($process.Id))`n"
$message += "Path: $($process.Path)`n`n"
$message += "Do you want to terminate this process to free the port?"

$result = [System.Windows.Forms.MessageBox]::Show(
    $message,
    "Port $Port In Use - Kill Process?",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($result -eq [System.Windows.Forms.DialogResult]::No) {
    Write-Host "`n[!] User chose not to kill the process" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    [System.Windows.Forms.MessageBox]::Show(
        "Workflow cancelled.`n`nPlease manually stop the service using port $Port and try again.",
        "Workflow Cancelled",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
    
    exit 1
}

# User chose to kill - attempt to terminate
Write-Host "`n[*] Attempting to terminate process $($process.ProcessName) (PID: $($process.Id))..." -ForegroundColor Yellow

try {
    Stop-Process -Id $process.Id -Force -ErrorAction Stop
    Start-Sleep -Seconds 2
    
    # Verify the port is now free
    if (-not (Test-PortInUse -Port $Port)) {
        Write-Host "[PASS] Successfully terminated process and freed port $Port" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        [System.Windows.Forms.MessageBox]::Show(
            "Process successfully terminated.`n`nPort $Port is now available for $ServiceName.",
            "Success",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        ) | Out-Null
        
        exit 0
    } else {
        # Process was killed but port still in use (might be another process now)
        $newProcess = Get-PortProcess -Port $Port
        Write-Host "[FAIL] Port $Port is still in use after terminating process" -ForegroundColor Red
        
        if ($newProcess -and $newProcess.Id -ne $process.Id) {
            Write-Host "    New process detected: $($newProcess.ProcessName) (PID: $($newProcess.Id))" -ForegroundColor Yellow
        }
        
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        [System.Windows.Forms.MessageBox]::Show(
            "Process was terminated but port $Port is still in use.`n`nPlease manually verify and stop any services using this port, then try again.",
            "Port Still In Use",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        ) | Out-Null
        
        exit 1
    }
} catch {
    Write-Host "[FAIL] Failed to terminate process: $_" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    [System.Windows.Forms.MessageBox]::Show(
        "Failed to terminate the process.`n`nError: $_`n`nPlease manually stop the service using port $Port and try again.",
        "Failed to Kill Process",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
    
    exit 1
}
