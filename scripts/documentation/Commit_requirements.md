# Commit.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to Commit.ps1, update this requirements file to reflect the changes.

- Requires a commit message as a mandatory parameter.
- Stages all changes in the repository (git add -A).
- Checks if there are any changes to commit after staging.
- If there are no changes to commit, exits gracefully with code 0 without committing.
- If there are changes, commits staged changes with the provided commit message.
- Exits with the same code as the git commit process (0 for success, 1 for failure).
- Outputs success or error messages based on commit result.
- Does NOT push changes to remote (use separate push command).
- Does NOT open any browser windows.
