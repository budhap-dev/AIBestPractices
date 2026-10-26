# Items to verify

Checked against the official VS Code and GitHub Copilot docs on 14 Oct 2026. These items could not be confirmed. Recheck them before each demo, and when you confirm or fix one, remove `verify: true` from its entry in `src/content/`.

| Item | Where | What we found |
|---|---|---|
| `@workspace` | `commands.json` → `part-workspace` | Not mentioned in the current VS Code Copilot docs. Whole-project context is now done with `#codebase` and the agent's search tools. No deprecation notice found. |
| Cycle inline suggestions (⌥] / Alt+]) | `commands.json` → `sc-cycle` | Not on the current suggestions page or the cheat sheet. Older docs gave these shortcuts. |

## Also worth rechecking

These are confirmed, but they change often or were confirmed only through official-domain search results rather than a direct page read:

- **Billing.** AI credits per token since June 2026; premium requests are legacy (annual Pro/Pro+ only). See `context.json` → `ctx-billing`.
- **Auto model discount.** The size of the discount is not stated; the guide only says "small".
- **Assign an issue to Copilot.** The steps and the "cloud agent" naming (`beyond.json` → `bey-cloud`).
- **"Suggestions matching public code" Allow/Block wording** (`security.json` → `sec-public-code`).
- **`#file:path` in typed prompts.** The docs describe picking files after typing `#`. [PROMPTS.md](PROMPTS.md) uses `#file:docs/SPEC.md`. If that text form doesn't attach the file in your VS Code version, type `#` and pick the file instead.
- **No keyboard shortcut for switching chat modes** is documented; the guide says to use the Agent picker.
- **Research figures** (`opening.json`). Checked on the primary sources on 15 Oct 2026. METR's July 2025 result is about early-2025 tools; its Feb 2026 follow-up points to a speed-up but METR calls that data unreliable, so recheck before quoting. DORA 2025 publishes no effect sizes, so the guide quotes DORA 2024.
- **Approval options** in the approval gate diagram (`diagrams.json` → `approvalGate`) are plain-English labels for the Allow choices in VS Code, not the exact button text.
- **`/fixTestFailure`** is not on the current cheat sheet, so the guide leaves it out. Use the Fix Test Failure button in Test Explorer.
