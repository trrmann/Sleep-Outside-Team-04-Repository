# ValidatePort.ps1 Requirements

## Purpose

Ensure a specified port is available for use by the application. If the port is in use, identify and optionally terminate the process using it.

## Functional Requirements

1. **Port Availability Check**
   - The script must accept a port number as a parameter.
   - It must check if the port is currently in use.
2. **Process Identification**
   - If the port is in use, the script must identify the process (name, PID, path) using the port.
3. **User Popup Prompt for Action**
   - The script must present a popup message to the user with Yes/No options:
     - The popup must include a timeout of 10 seconds. If the user does not respond within the timeout, the script must default to a **Yes** response.
     - **Yes** (or timeout): Attempt to kill the process using the port.
     - **No**: Exit gracefully, informing the user that the workflow is cancelled.
4. **Post-Kill Verification and User Notification**
   - After attempting to kill the process, the script must re-check if the port is free.
   - It must present a popup message with an OK button only, informing the user whether the port was successfully freed or not.
   - If the port is free, the script must exit successfully (exit code 0).
   - If the port is still in use, the script must exit with an error (exit code 1).
   - The OK popup must include a timeout of 10 seconds. If the user does not respond within the timeout, the script must proceed as if OK was clicked.
5. **Edge Case Handling**
   - If the process cannot be identified, the script must inform the user and exit with an error.
   - If the kill operation fails, the script must inform the user and exit with an error.
   - If a new process takes over the port immediately after killing, the script must inform the user and exit with an error.

## Non-Functional Requirements

1. The script must be robust and handle all edge cases gracefully.
2. All user prompts must use GUI popups when possible; fallback to console prompts if not interactive.
3. The script must be compatible with Windows PowerShell 5.1+ and PowerShell Core 7+.
4. All messages must be clear and actionable.

## Implementation Requirements for Timeout Dialogs

### Critical: Windows Forms with Timer Control Required

**DO NOT use WScript.Shell.Popup** - The timeout parameter does not work reliably in PowerShell environments.

**DO NOT use background jobs with MessageBox** - This approach has compilation errors and is unreliable.

**REQUIRED APPROACH: Windows Forms with Timer Controls**

1. **Required Assemblies**
   ```powershell
   Add-Type -AssemblyName System.Windows.Forms
   Add-Type -AssemblyName System.Drawing
   ```

2. **Required Win32 API P/Invoke for Window Focusing**
   - Must define Win32.User32 type with the following methods:
     - `SetForegroundWindow` - Set window to foreground
     - `GetForegroundWindow` - Get current foreground window
     - `GetWindowThreadProcessId` - Get thread ID of window
     - `GetCurrentThreadId` - Get current thread ID
     - `AttachThreadInput` - Attach to foreground thread
     - `BringWindowToTop` - Bring window to top of Z-order
     - `ShowWindow` - Show/restore window
     - `FlashWindow` - Flash window to get attention

3. **Force-WindowToFront Helper Function**
   - Must implement aggressive window focusing using:
     1. Attach to foreground window's thread
     2. ShowWindow with SW_RESTORE (9)
     3. BringWindowToTop
     4. SetForegroundWindow
     5. FlashWindow
     6. Detach from foreground thread
   - This ensures dialogs appear with focus, especially in automated workflows

4. **Dialog Implementation Requirements**

   **Form Configuration:**
   - TopMost = $true
   - StartPosition = CenterScreen
   - FormBorderStyle = FixedDialog
   - MaximizeBox = $false
   - MinimizeBox = $false
   - ShowInTaskbar = $true

   **Countdown Timer Configuration:**
   - Interval = 1000 (1 second in milliseconds)
   - **CRITICAL**: Use `$script:countdown` for variable scoping (NOT `$countdown`)
   - Timer scriptblock must have access to form variable for closing

   **Countdown Label Configuration:**
   - Font: Bold, Size 10
   - ForeColor: Dark Red (System.Drawing.Color::DarkRed)
   - TextAlign: MiddleCenter
   - Must be visible to user throughout countdown

   **Timer Tick Logic (CRITICAL ORDER):**
   ```powershell
   # MUST check countdown BEFORE decrementing
   if ($script:countdown -le 0) {
       $timer.Stop()
       $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
       $form.Close()
   } else {
       $script:countdown--
       $countdownLabel.Text = "Auto-closing in $script:countdown seconds..."
   }
   ```
   - **WHY**: Checking after decrement causes countdown to show 0 on first tick
   - **WHY**: Using `$countdown` instead of `$script:countdown` causes timer to fail silently

   **Form.Add_Shown Event:**
   - Must call Force-WindowToFront function
   - Ensures dialog appears with focus when shown

5. **Yes/No Dialog Specific Requirements**
   - Timeout defaults to "Yes" (DialogResult 6)
   - Must have explicit Yes and No buttons
   - Countdown label must indicate which option will be selected on timeout
   - Example: "Auto-selecting Yes in 10 seconds..."

6. **OK Dialog Specific Requirements**
   - Timeout closes dialog (DialogResult OK)
   - Must have explicit OK button
   - Countdown label indicates auto-close behavior
   - Example: "Auto-closing in 10 seconds..."

7. **Return Values**
   - Yes/No Dialog: Return 6 (Yes), 7 (No), or -1 (timeout/error)
   - OK Dialog: Return DialogResult from ShowDialog()
   - Calling code must handle timeout case appropriately

8. **Testing Requirements**
   - Timer must tick 11 times for 10-second countdown (ticks at 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0)
   - Total elapsed time should be approximately 11 seconds (10 seconds + dialog close time)
   - Countdown must be visible and accurate (not skip numbers)
   - Window must appear with focus (not behind other windows)
   - User must be able to click buttons before timeout expires

### Debugging Tips

If implementing this functionality:
- Add timing debug output to verify countdown accuracy
- Use `Get-Date` before and after dialog to measure elapsed time
- Add tick counter to verify timer fires correct number of times
- Test both timeout and manual button clicks
- Verify window appears with focus in automated workflow context
