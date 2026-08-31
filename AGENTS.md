# Agent Execution Guidelines & Constraints

## 🛡️ Repository Access & Permissions

- **Read-Only Baseline**: Baseline repository is strictly read-only for the agent.
- **No Modifications**: Never write, commit, push, edit, modify, reset, checkout, or alter the repository.
- **User Executes Actions**: The user handles all commits and execution after verification.
- **Write Access**: The agent cannot write, commit, push, or modify the repository in any way with user's approval'.
- **Create dev branch**: The agent can create a dev branch for write access activities and the raise PR to working
  branch.
- **Workspace State**: Assume the workspace is clean and ready for changes unless explicitly told otherwise.

## 🔍 Codebase Inspection & Architecture

- **Target Application**: `x2-forex-app`
- **Zero Assumptions**: Do not assume codebase behavior. Always inspect the relevant architecture and dependencies
  first.
- **Holistic Analysis**: For large changes, trace the entire code flow across the codebase, not just the file showing
  the immediate error.
- **Root Cause Isolation**: Identify the actual underlying issue before proposing changes. Avoid speculative fixes.
- **Prevent Regressions**: Previous cleanup tasks broke FX, crypto, metals, and UI flows. Double/triple-check all logic
  to avoid repeating past mistakes.

## 🛠️ Implementation Style

- **Complete Files**: When providing code, deliver complete replacement files where practical. Do not provide partial
  patches or snippets.

## 🧪 Mandatory Verification & Testing

- **Pre-Commit Testing**: Code changes are not ready until all relevant tests pass.
- **Beyond TypeScript**: A passing `npx tsc --noEmit` is insufficient.
- **Runtime Verification**: Verification must actively cover integration, runtime behavior, module resolution, and Expo
  bundling/runtime mechanics.

## 💻 Command Hygiene & Efficiency

- **Triple-Check Commands**: Evaluate if a command is strictly required before presenting it.
- **No Redundancy**: Do not request redundant commands (e.g., unnecessary `git fetch`, `git pull`, `git reset`, or
  repeated status checks).
- **Reset Rules**: Only suggest a rollback or reset if there is an active failure.
- **Current Baseline**:
    - `origin/cleanup/fix-architecture` = `98dd163`
    - Working tree = clean
    - *Constraint*: No reset is currently required.

## ⏱️ Response Optimization

- **High Efficiency**: Keep responses concise. Eliminate excessive explanations.
- **Action-Oriented**: Figure out the path forward internally, then deliver only the necessary actionable steps.
