# Copilot Field Guide
Static internal site teaching everyday GitHub Copilot best practices in VS Code.
Spec: docs/SPEC.md (read only the sections a task names). State: docs/PROGRESS.md.

## Rules
- Vite + React + TypeScript, plain CSS custom properties. Static only: no backend, analytics or runtime CDNs.
- All guide content lives in typed data files in src/content/. Components never hard-code content.
- Responsive 360px to wide, light/dark, WCAG 2.2 AA, keyboard accessible, respects reduced motion.
- Every Copilot command, shortcut or file path needs a source URL (docs.github.com/copilot or code.visualstudio.com/docs/copilot). If unconfirmed: `verify: true` plus a line in VERIFY.md. Never invent features or use other AI tools' commands.

## How to work
- Open and edit only the files the task needs.
- Make all edits, then run `npm run build` once. Re-run only after fixing a failure.
- Do not restate the task or paste whole files. End every reply with at most 8 lines: changed, left, to verify.
- At the end of a phase, update docs/PROGRESS.md in at most 15 lines: done, decisions, next step.
