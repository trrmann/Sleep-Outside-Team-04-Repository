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

# Load Windows Forms for dialogs
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Add Windows API for forcing window to foreground
if (-not ([System.Management.Automation.PSTypeName]'Win32.User32').Type) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;
namespace Win32 {
    public class User32 {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool SetForegroundWindow(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        
        [DllImport("user32.dll")]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);
        
        [DllImport("kernel32.dll")]
        public static extern uint GetCurrentThreadId();
        
        [DllImport("user32.dll")]
        public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
        
        [DllImport("user32.dll")]
        public static extern bool BringWindowToTop(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        
        [DllImport("user32.dll")]
        public static extern bool FlashWindow(IntPtr hWnd, bool bInvert);
        
        public const int SW_SHOW = 5;
        public const int SW_RESTORE = 9;
    }
}
"@
}

# Function to force window to foreground (aggressive approach)
function Force-WindowToFront {
    param([IntPtr]$WindowHandle)
    
    try {
        # Get current foreground window
        $foregroundWindow = [Win32.User32]::GetForegroundWindow()
        $currentThreadId = [Win32.User32]::GetCurrentThreadId()
        $foregroundThreadId = [Win32.User32]::GetWindowThreadProcessId($foregroundWindow, [IntPtr]::Zero)
        
        # Attach to the foreground thread
        [Win32.User32]::AttachThreadInput($currentThreadId, $foregroundThreadId, $true) | Out-Null
        
        # Show and restore the window
        [Win32.User32]::ShowWindow($WindowHandle, [Win32.User32]::SW_RESTORE) | Out-Null
        [Win32.User32]::ShowWindow($WindowHandle, [Win32.User32]::SW_SHOW) | Out-Null
        
        # Bring to top and set foreground
        [Win32.User32]::BringWindowToTop($WindowHandle) | Out-Null
        [Win32.User32]::SetForegroundWindow($WindowHandle) | Out-Null
        
        # Flash the window to get attention
        [Win32.User32]::FlashWindow($WindowHandle, $true) | Out-Null
        Start-Sleep -Milliseconds 100
        [Win32.User32]::FlashWindow($WindowHandle, $false) | Out-Null
        
        # Detach from the foreground thread
        [Win32.User32]::AttachThreadInput($currentThreadId, $foregroundThreadId, $false) | Out-Null
    } catch {
        # If aggressive approach fails, try simple approach
        [Win32.User32]::SetForegroundWindow($WindowHandle) | Out-Null
    }
}

# Function to show OK dialog with auto-close timeout
function Show-OkDialog {
    param(
        [string]$Message,
        [string]$Title,
        [int]$TimeoutSeconds = 10,
        [System.Windows.Forms.MessageBoxIcon]$Icon = [System.Windows.Forms.MessageBoxIcon]::Information
    )
    
    # Create form
    $form = New-Object System.Windows.Forms.Form
    $form.Text = $Title
    $form.Size = New-Object System.Drawing.Size(500, 230)
    $form.StartPosition = 'CenterScreen'
    $form.TopMost = $true
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    
    # Add event handler to force focus
    $form.Add_Shown({
        $form.Activate()
        $form.BringToFront()
        $form.Focus()
        Force-WindowToFront -WindowHandle $form.Handle
    })
    
    # Create icon picture box
    $iconBox = New-Object System.Windows.Forms.PictureBox
    $iconBox.Location = New-Object System.Drawing.Point(20, 20)
    $iconBox.Size = New-Object System.Drawing.Size(32, 32)
    $iconBox.SizeMode = 'CenterImage'
    
    # Set icon based on type
    switch ($Icon) {
        'Error' { $iconBox.Image = [System.Drawing.SystemIcons]::Error.ToBitmap() }
        'Warning' { $iconBox.Image = [System.Drawing.SystemIcons]::Warning.ToBitmap() }
        'Information' { $iconBox.Image = [System.Drawing.SystemIcons]::Information.ToBitmap() }
        default { $iconBox.Image = [System.Drawing.SystemIcons]::Information.ToBitmap() }
    }
    $form.Controls.Add($iconBox)
    
    # Create label for message
    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(65, 20)
    $label.Size = New-Object System.Drawing.Size(410, 100)
    $label.Text = $Message -replace '`n', [System.Environment]::NewLine
    $form.Controls.Add($label)
    
    # Create countdown label
    $countdownLabel = New-Object System.Windows.Forms.Label
    $countdownLabel.Location = New-Object System.Drawing.Point(20, 130)
    $countdownLabel.Size = New-Object System.Drawing.Size(450, 20)
    $countdownLabel.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
    $countdownLabel.ForeColor = [System.Drawing.Color]::DarkRed
    $countdownLabel.TextAlign = 'MiddleCenter'
    $form.Controls.Add($countdownLabel)
    
    # Create OK button
    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Location = New-Object System.Drawing.Point(210, 160)
    $okButton.Size = New-Object System.Drawing.Size(80, 30)
    $okButton.Text = 'OK'
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Controls.Add($okButton)
    $form.AcceptButton = $okButton
    
    # Timer for countdown and auto-close
    $script:countdown = $TimeoutSeconds
    $timer = New-Object System.Windows.Forms.Timer
    $timer.Interval = 1000  # 1 second
    
    $tickCount = 0
    $timer.Add_Tick({
        $tickCount++
        Write-Host "[DEBUG] OK Dialog Timer Tick #$tickCount at $(Get-Date -Format 'HH:mm:ss.fff') - Countdown: $script:countdown" -ForegroundColor Magenta
        
        if ($script:countdown -le 0) {
            Write-Host "[DEBUG] OK Dialog countdown reached 0 - closing dialog" -ForegroundColor Magenta
            $timer.Stop()
            $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
            $form.Close()
        } else {
            $script:countdown--
            $countdownLabel.Text = "Auto-closing in $script:countdown seconds..."
        }
    })
    
    $countdownLabel.Text = "Auto-closing in $script:countdown seconds..."
    Write-Host "[DEBUG] OK Dialog starting with $TimeoutSeconds second timeout at $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Magenta
    $timer.Start()
    
    # Show dialog
    $dialogStartTime = Get-Date
    $result = $form.ShowDialog()
    $dialogEndTime = Get-Date
    $dialogElapsed = ($dialogEndTime - $dialogStartTime).TotalSeconds
    
    $timer.Stop()
    Write-Host "[DEBUG] OK Dialog closed at $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Magenta
    Write-Host "[DEBUG] OK Dialog was open for $([math]::Round($dialogElapsed, 2)) seconds" -ForegroundColor Magenta
    Write-Host "[DEBUG] OK Dialog result: $result" -ForegroundColor Magenta
    $form.Dispose()
    
    return $result
}

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
    
    $errorMsg = "Port $Port is in use but the process cannot be identified.`n`nPlease manually stop the service using port $Port and try again."
    Show-OkDialog -Message $errorMsg -Title "Port $Port In Use" -Icon Warning
    
    exit 1
}

Write-Host "[!] Port $Port is in use" -ForegroundColor Yellow
Write-Host "    Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
Write-Host "    Path: $($process.Path)" -ForegroundColor Gray

# Ask user if they want to kill the process (with 10-second timeout)
$message = "Port $Port is currently in use by:`n`n"
$message += "Process: $($process.ProcessName) (PID: $($process.Id))`n"
$message += "Path: $($process.Path)`n`n"
$message += "Do you want to terminate this process to free the port?`n`n"
$message += "(Auto-selecting YES in 10 seconds...)"

Write-Host "`n[DEBUG] Showing popup at $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Cyan
$startTime = Get-Date

# Create form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Port $Port In Use - Kill Process?"
$form.Size = New-Object System.Drawing.Size(500, 250)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

# Add event handler to force focus when form is shown
$form.Add_Shown({
    $form.Activate()
    $form.BringToFront()
    $form.Focus()
    Force-WindowToFront -WindowHandle $form.Handle
})

# Create label for message
$label = New-Object System.Windows.Forms.Label
$label.Location = New-Object System.Drawing.Point(20, 20)
$label.Size = New-Object System.Drawing.Size(450, 120)
$label.Text = $message -replace '`n', [System.Environment]::NewLine
$form.Controls.Add($label)

# Create countdown label
$countdownLabel = New-Object System.Windows.Forms.Label
$countdownLabel.Location = New-Object System.Drawing.Point(20, 145)
$countdownLabel.Size = New-Object System.Drawing.Size(450, 20)
$countdownLabel.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
$countdownLabel.ForeColor = [System.Drawing.Color]::DarkRed
$form.Controls.Add($countdownLabel)

# Create Yes button
$yesButton = New-Object System.Windows.Forms.Button
$yesButton.Location = New-Object System.Drawing.Point(200, 175)
$yesButton.Size = New-Object System.Drawing.Size(80, 30)
$yesButton.Text = 'Yes'
$yesButton.DialogResult = [System.Windows.Forms.DialogResult]::Yes
$form.Controls.Add($yesButton)
$form.AcceptButton = $yesButton

# Create No button
$noButton = New-Object System.Windows.Forms.Button
$noButton.Location = New-Object System.Drawing.Point(290, 175)
$noButton.Size = New-Object System.Drawing.Size(80, 30)
$noButton.Text = 'No'
$noButton.DialogResult = [System.Windows.Forms.DialogResult]::No
$form.Controls.Add($noButton)
$form.CancelButton = $noButton

# Timer for countdown and auto-close
$countdown = 10
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1000  # 1 second

$timer.Add_Tick({
    $script:countdown--
    $countdownLabel.Text = "Auto-selecting YES in $script:countdown seconds..."
    
    if ($script:countdown -le 0) {
        $timer.Stop()
        $form.DialogResult = [System.Windows.Forms.DialogResult]::Yes
        $form.Close()
    }
})

$countdownLabel.Text = "Auto-selecting YES in $countdown seconds..."
$timer.Start()

# Show dialog
$result = $form.ShowDialog()
$timer.Stop()
$form.Dispose()

$endTime = Get-Date
$elapsed = ($endTime - $startTime).TotalSeconds
Write-Host "[DEBUG] Popup closed at $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Cyan
Write-Host "[DEBUG] Elapsed time: $([math]::Round($elapsed, 2)) seconds" -ForegroundColor Cyan
Write-Host "[DEBUG] Dialog result: $result" -ForegroundColor Cyan

# Convert dialog result to popup-style result code
if ($result -eq [System.Windows.Forms.DialogResult]::No) {
    $popupResult = 7  # No
} elseif ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
    $popupResult = 6  # Yes (includes timeout)
} else {
    $popupResult = -1  # Cancel or other
}

Write-Host "[DEBUG] Popup result code: $popupResult (-1=timeout, 6=Yes, 7=No)" -ForegroundColor Cyan

# Handle user response
if ($popupResult -eq 7) {
    # No clicked - exit without killing
    Write-Host "`n[!] User chose NOT to kill the process" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $cancelMsg = "Workflow cancelled.`n`nThe process was NOT terminated.`nPlease manually stop the service using port $Port and try again."
    Show-OkDialog -Message $cancelMsg -Title "Workflow Cancelled" -Icon Information
    
    exit 1
}

# Timeout or Yes clicked - proceed with killing
if ($popupResult -eq -1) {
    Write-Host "`n[!] No response within 10 seconds - defaulting to YES" -ForegroundColor Yellow
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
        
        $successMsg = "Process successfully terminated.`n`nPort $Port is now available for $ServiceName."
        Write-Host "[DEBUG] Showing OK popup at $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Cyan
        $okStartTime = Get-Date
        Show-OkDialog -Message $successMsg -Title "Success" -Icon Information
        $okEndTime = Get-Date
        $okElapsed = ($okEndTime - $okStartTime).TotalSeconds
        Write-Host "[DEBUG] OK popup closed at $(Get-Date -Format 'HH:mm:ss.fff')" -ForegroundColor Cyan
        Write-Host "[DEBUG] OK popup elapsed time: $([math]::Round($okElapsed, 2)) seconds" -ForegroundColor Cyan
        
        exit 0
    } else {
        # Process was killed but port still in use (might be another process now)
        $newProcess = Get-PortProcess -Port $Port
        Write-Host "[FAIL] Port $Port is still in use after terminating process" -ForegroundColor Red
        
        if ($newProcess -and $newProcess.Id -ne $process.Id) {
            Write-Host "    New process detected: $($newProcess.ProcessName) (PID: $($newProcess.Id))" -ForegroundColor Yellow
        }
        
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        $errorMsg = "Process was terminated but port $Port is still in use.`n`nPlease manually verify and stop any services using this port, then try again."
        Show-OkDialog -Message $errorMsg -Title "Port Still In Use" -Icon Warning
        
        exit 1
    }
} catch {
    Write-Host "[FAIL] Failed to terminate process: $_" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $errorMsg = "Failed to terminate the process.`n`nError: $_`n`nPlease manually stop the service using port $Port and try again."
    Show-OkDialog -Message $errorMsg -Title "Failed to Kill Process" -Icon Error
    
    exit 1
}
