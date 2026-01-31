# RunAndLog.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to RunAndLog.ps1, update this requirements file to reflect the changes.

- Runs `Run.ps1 <script>` and displays all output to the screen in real time.
- Logs all output and errors to per-run log files and appends failures/timeouts to `devworkflow_failures.log`.
- Waits for completion with a configurable timeout.
- If the process hangs, kills it and logs the timeout.
- Works in both interactive and non-interactive environments.
- Must not duplicate port check logic; relies on `DevWorkflow.ps1` and `ValidatePort.ps1` for that.
