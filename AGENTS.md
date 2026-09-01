# Agent Execution Guidelines & Constraints

## 🛡️ Repository Access & Permissions

- **Read-Only Mode**:
- **Read-Only Baseline**: Baseline repository is strictly read-only for the agent.
- **No Modifications**: Never write, commit, push, edit, modify, reset, checkout, or alter the repository.
- **User Executes Actions**: The user handles all commits and execution after verification.
- **Write Access Mode**:
- **Write Access**: The agent cannot write, commit, push, or modify the repository in any way with user's approval'.
- **Create dev branch**: The agent can create a dev branch for write access activities and the raise PR to working
  branch.
- **Workspace State**: Assume the workspace is clean and ready for changes unless explicitly told otherwise.
- ** Current Mode**: Write Access Mode

## 📐 Architecture & React Engineering Standards

- **Pattern Model**: Enforce a strict **Feature-Based Architecture / Domain-Driven Design**. Maintain clear separation
  between UI Presentation, Custom Hooks (Business Logic), and API Services.
- **File Length Constraint**: Strict cap on source file length. No file may exceed 600 lines.
- **Component Splitting**: Break down monolithic structures into atomic, single-responsibility UI primitives and
  localized feature blocks.
- **State & Logic Isolation**: Isolate presentation from core logic. Use dedicated Custom Hooks for complex component
  states and side effects.
- **TypeScript Type Safety**: Enforce strict typing. Never use `any`. Always explicitly define interfaces for component
  props, API payloads, and state models.
- **Performance Hygiene**: Optimize rendering loops. Avoid inline arrow functions and raw object declarations inside JSX
  returns to prevent unnecessary virtual DOM re-renders.

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

- **Pre-Commit Testing**: Code changes are not considered ready until all relevant automated tests pass.
- **Beyond TypeScript**: A passing compile check or `tsc --noEmit` is insufficient.
- **Runtime Verification**: Verification must actively cover end-to-end integration, runtime execution, module
  resolution, and platform-specific bundling mechanics.

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
