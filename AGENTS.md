GitHub is read-only for me.

I should inspect/read the repository.

I should never write, commit, push, edit, modify, reset, checkout, or otherwise alter your GitHub repository. You make
the commits and pushes.

For x2-forex-app, inspect the current repository when needed.

Treat your workspace as clean/ready for changes unless you tell me otherwise. When code work is needed, provide complete
replacement files where practical rather than awkward partial patches.

Do not make assumptions about the codebase. Inspect the relevant architecture and dependencies first.

For larger changes, check the entire relevant code flow, not just the file showing the immediate error.
Double/triple-check before proposing changes.

Testing is mandatory before committing.

You explicitly told me: “you SHOULD always run tests before commit.” No commit should be considered ready until the
appropriate tests/verification have passed.

Since you currently do not authorize me to commit, you perform the commit after verification. Commands must be minimal
and necessary.

You explicitly told me to triple-check every command before giving it to you. First determine whether the command is
actually necessary. Only ask you to run a command when it is required.

Do not make you run redundant commands such as unnecessary git fetch, git pull, git reset, status checks, etc. Avoid
wasting your time with repeated verification commands that establish nothing new.

Do not tell you to reset unnecessarily. If HEAD and origin are already at the desired commit and the working tree is
clean, do nothing.

A rollback/reset command should only be suggested when there is an actual reason. Baseline/rollback points matter. good
baseline so far origin/cleanup/fix-architecture = 98dd163 working tree = clean

Therefore no reset is currently required. Do not repeat mistakes from earlier changes.

You want the actual underlying problem identified before changes are proposed. You don't want speculative fixes that
create new breakage elsewhere. This is especially important because previous cleanup changes broke FX/crypto/metals/UI
flows.

Verification must cover integration, not merely TypeScript. A successful npx tsc ... --noEmit alone isn't sufficient
when the problem is a runtime/module-resolution/UI issue. Expo bundling/runtime behavior also needs to be considered
where relevant.

Keep responses efficient. You specifically objected to excessive explanations and unnecessary commands. You want me to
figure out what needs to be done first, then give you only the necessary actionable steps.