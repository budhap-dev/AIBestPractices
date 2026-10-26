# SPEC: Copilot Field Guide
Audience: [COMPANY] developers of mixed Copilot experience. Use: live demo, then an everyday reference.

## §1 Tech
Vite + React + TS, plain CSS. Static build for internal hosting. Content in src/content/*.json with TS types; each item: id, title, body, tags, sourceUrl, verify.
Footer shows "Last reviewed" and "Owner: [NAME]" from src/content/meta.json. README covers run, build and editing content.

## §2 Design
Professional, calm, developer-tool look. Light/dark (follow the OS, with a toggle). Sticky side nav on desktop, collapsible menu on mobile. No horizontal scroll at 360px. Visible focus rings, semantic headings, aria labels on icon buttons. Print stylesheet for the cheat sheet (2 A4 pages max). Client-side search across tips, commands and templates.

## §3 Content sections
1. Mental model: what fills chat context (history, attached files, #refs, instruction files, agent tool output); why long chats drift; AI credits billed per token (input, output, cached) and why every prompt re-sends the whole context.
2. Chat modes: Ask / Plan / Agent (Edit is deprecated). When to use each, with one example each.
3. Cheat sheet: slash commands, @participants, #context variables, mac and win/linux shortcuts, model picker, new chat, context-usage indicator / summarisation (if they exist).
4. Daily workflow: new chat per task → focused context → plan → small steps → tests → review diff → commit. Decision guide for when a chat gets long: new chat / summarise / continue.
5. Do's and don'ts: 12 or more each, grouped as Context & cost, Prompting, Reviewing, Security. One-line "why" each.
6. Team memory: copilot-instructions.md, *.instructions.md (applyTo), .github/prompts/*.prompt.md, custom agents (.github/agents/*.agent.md), AGENTS.md, skills. One example file each.
7. Prompt templates with placeholders: bug fix, feature, refactor, tests, explain code, code review, commit message.
8. Security: secrets, customer data, content exclusions, public-code matching / code referencing, link to [AI POLICY URL].
9. Beyond the editor: Copilot PR review, commit messages, terminal.

## §4 Interactive
a. Context meter: actions (attach file, paste big log, follow-up, agent runs tests) fill a bar and lower a quality gauge. "New chat" and "Summarise" show what they keep. A cost counter bills each model call on the whole window, scaled by a relative model price (illustrative numbers, labelled as such).
b. Scenario quiz: 8–10 scenarios, multiple choice, with explanations.
c. Prompt builder: goal, files, constraints, acceptance criteria and mode come out as a copyable prompt.
d. Daily checklist saved in localStorage (try/catch), with reset.
e. Copy buttons with a toast on every command and template.

## §5 Done
Build passes with no type or lint errors. Every section works at 360/768/1280px in both themes. Every claim has a sourceUrl or verify flag. No content hard-coded in components.
