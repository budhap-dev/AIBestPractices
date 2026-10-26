# Progress
Phase: all phases done (PR 1 app, PR 2 polish + docs).

## Done
- Vite + React + TS scaffold, theming (system/light/dark), sticky nav, mobile drawer, search, print cheat sheet.
- Content in src/content/*.json, verified against official docs on 2026-10-14 (89/94 facts confirmed).
- Interactive: context meter (per-token cost), quiz, prompt builder, daily checklist, copy buttons.
- Responsive pass at 375/768/1280 in light and dark; README; VERIFY.md.

## Decisions
- Audience (endUsers, demoAudience) and readingWordsPerMinute live in meta.json; slide read time = words shown when fully revealed / wpm, rounded up to 5 s.
- Presenter mode (#/present/n): deck built from content in src/presenter/deck.ts; fragments reveal per key press; 4 slide transitions.
- Themes: appearance + 6 accent palettes via data-palette and light-dark(); circular view-transition reveal.
- One page per section with hash routing (#/section/item); legacy #id links redirect. Print view renders cheat sheet + do's and don'ts.
- Billing is AI credits per token since June 2026; premium requests are legacy. Meter shows cost per model call on the whole window.
- Edit mode is deprecated: modes are Ask / Plan / Agent.
- @workspace and suggestion cycling flagged verify: true (see VERIFY.md).

- Oct 2026: Key terms section + glossary links on every page; Prompt cost section; animated diagrams (request flow, snowball, prompt anatomy, modes, chat flow, team memory) on pages and as deck slides; Did you know? facts (sourced, checked 15 Oct 2026); Wrap-up section; confetti for quiz, checklist and deck end; Random transition.
- Diagram series colours (--dg-1..5) come from a CVD-validated categorical palette, stepped for dark; text stays in text colours.

- Oct 2026 content revision (prompts/content-revision.md):
  - New first section "Why it matters" (opening.json): the old way, then-and-now diagram, research figures checked on primary sources 15 Oct 2026, the catch, five factors, hand-over line.
  - Glossary: 38 terms in ai/copilot/code groups; `match` holds regexes. Pages list every term used anywhere on them (pageTerms). Deck: first use of a term shows a "New word" note; the Key terms deck slides cover the AI group only.
  - Pictures: 28 inline SVG scenes (Illustrations.tsx), palette-coloured, still under reduced motion. stories.json gives every slide a scene; 72 teaching slides have Asha/Ben stories, revealed last; dev console warns on gaps.
  - New diagrams (diagrams.json): then-and-now, context stack, daily loop, approval gate, prefixes.
  - Deck: slide sits on a stage with footer; 5 slide designs (D key, picker); cheat-sheet tables split at 4 rows, context cards at 2. Finale after Questions?: teaser, peel to live counts, live controls + QR, build prompt + QR (finale.json, prompts/build-this-app.md).
  - Checked with headless Chrome: 103 slides fit at 1280x720 and 800x600; no page overflow at 360/768/1280.
  - Mental model nav renamed "How context works" so "model" only means an AI model.

- Short talk (talk.json): 25 of 103 slides, ~13 min read; default in presenter, S or toolbar picker switches to the full deck at the same slide. Both decks get their own New word notes, quiz numbers and timings. Overview dims skipped slides; picking one switches to full. Fixed: overview grid wider than the window; research figures shrunk by a paragraph rule.

- Fixed text overlapping the Asha/Ben strip: slide children no longer shrink (flex-shrink: 0), so tall content can't spill over the story. Daily loop is a wide oval on slides; New words show one label; tighter request-flow and snowball spacing on slides. Checked for overlaps at 8 window sizes, both decks.
- Finale: "Thank you for your patience" is now the last slide (both decks). The peel copies the "One more thing…" slide and no longer replays when the slide animates out or is revisited, which had flashed "Questions?".
- Choose slides: the overview's "Choose slides" mode ticks slides in or out of the short talk. The pick is saved in localStorage (cfg-talk), cleared when it matches talk.json; Reset restores it; "Copy for talk.json" copies the ids. Checked in headless Chrome: add, reload, reset, removing the current slide.

## Next
- Set `siteUrl` in meta.json once the guide is hosted, so the phone QR code points at the real address.
- Fill company, owner and policy link in src/content/meta.json.
- Check the print cheat sheet in a real browser print preview.
