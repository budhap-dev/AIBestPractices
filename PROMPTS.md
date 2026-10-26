# Build prompts

Copy one prompt per phase into Copilot Chat. Start a **new chat** for every phase; docs/PROGRESS.md carries the state between them. Don't attach this file to a chat.

Since June 2026 Copilot bills in AI credits, per token, and every prompt re-sends the whole chat. So the saving comes from small contexts, short replies and cheaper models for routine phases. Agent runs are charged for every model call they make.

| Phase | Mode | Model |
|---|---|---|
| 0 Plan | Agent | Large |
| 1 Scaffold | Agent | Large |
| 2 Research | Agent | Large |
| 3 Content | Agent | Auto |
| 4a Context meter | Agent | Large |
| 4b–4e Other interactive | Agent | Auto |
| 5 Polish | Agent | Auto |
| 6 Docs | Agent | Auto |

## Phase 0: Plan
```text
#file:docs/SPEC.md Plan the build: file tree, TS content types, component list, and phases 1–6 below. Write it into docs/PROGRESS.md (max 40 lines). No code.
Phases: 1 scaffold, 2 research, 3 content, 4 interactive, 5 polish, 6 docs.
```

## Phase 1: Scaffold
```text
#file:docs/PROGRESS.md Do phase 1 using SPEC §1–§2 (#file:docs/SPEC.md): scaffold, layout, theming, nav, content types, 2 sample entries per type.
```

## Phase 2: Research (the only chat that fetches docs)
```text
#file:docs/PROGRESS.md Do phase 2: verify the Copilot features listed in SPEC §3 items 2, 3, 6, 8, 9 against docs.github.com/copilot and code.visualstudio.com/docs/copilot. Fetch only the pages you need. Write the confirmed facts with sourceUrl into src/content/facts.json; anything unconfirmed gets verify: true. Do not summarise the pages in chat.
```

## Phase 3: Content
```text
#file:docs/PROGRESS.md Do phase 3: fill SPEC §3 sections 1–9 into src/content/ using only #file:src/content/facts.json for Copilot facts. Do not fetch docs.
```
If the agent runs out of room, split this phase into sections 1–5 and 6–9 in two chats.

## Phase 4: Interactive (one chat per feature)
```text
#file:docs/PROGRESS.md Do phase 4a: build the context meter from SPEC §4a. Touch only its component, its styles and the page that mounts it.
```
Repeat with 4b, 4c, 4d and 4e.

## Phase 5: Polish
```text
#file:docs/PROGRESS.md Do phase 5: search, print stylesheet, then an accessibility and responsive check at 360/768/1280px against SPEC §2. List the issues first, then fix them.
```

## Phase 6: Docs
```text
#file:docs/PROGRESS.md Do phase 6: README (run, build, edit content) and VERIFY.md from every verify: true item. Check SPEC §5 and report anything that fails.
```

## Fix-up (any phase, same chat)
```text
#problems Fix these errors only. No other changes.
```

## Habits while building
- **Attach files instead of pasting them.** Use `#file`, `#problems` and `#terminalLastCommand` rather than pasting code or logs.
- **Two strikes, then a new chat.** If Copilot gets something wrong twice, start a new chat with a corrected prompt.
- **Keep the instructions file short.** It's sent with every request, so anything long belongs in docs/SPEC.md.
- **Review the diff before moving on.** docs/PROGRESS.md is the only memory between chats, so check it's accurate.
