# Build this app in one prompt

Paste everything below the line into a coding agent (for example Copilot in Agent mode), in an empty folder. It recreates the Copilot Field Guide: the site, the presenter deck, the diagrams, the themes and the accessibility rules. The content files hold the words; the prompt says what each one must contain, so you can point it at your own team, tool and research.

---

Build **Copilot Field Guide**, a static web app that teaches everyday GitHub Copilot habits in VS Code to developers who know how to code but are new to AI. It works two ways: as a reference site people keep open next to their editor, and as a slide deck for a live team session. Both are built from the same typed content, so they never drift apart.

## Stack and rules

- Vite, React 19 and TypeScript (strict), plain CSS with custom properties. No CSS framework.
- Fully static: no backend, analytics or runtime CDNs. `vite.config.ts` uses `base: './'` so `dist/` works from any folder.
- Hash routing so any static host works without rewrites: `#/` home, `#/<section>` one page per section, `#/<section>/<item>` a page scrolled to one item, `#/present/<n>` the deck at slide n. Old single-page links like `#cmd-clear` redirect to the right page.
- Runtime dependencies: `react`, `react-dom` and `qrcode` (for the QR codes). Nothing else.
- Scripts: `dev`, `build` (`tsc -p . && vite build`), `typecheck`, `lint` (ESLint flat config with typescript-eslint and react-hooks), `preview`. A GitHub Actions workflow runs `npm ci`, `npm run lint` and `npm run build` on Node 24.
- **All content lives in typed JSON in `src/content/`.** Components never hard-code guide text. `src/content/types.ts` defines every shape and `src/content/index.ts` is the single import point.
- Every Copilot command, shortcut, setting or file path carries a `sourceUrl` on docs.github.com/copilot or code.visualstudio.com/docs. If a claim can’t be confirmed, mark it `verify: true` (shown as a “Needs verification” badge) and list it in `VERIFY.md`. Never invent features or borrow other AI tools’ commands.
- Accessibility: WCAG 2.2 AA, fully keyboard operable, visible focus, skip link, headings in order, `prefers-reduced-motion` turns off every animation, layouts work from 360px to wide screens with no horizontal scroll, light and dark.

## Structure

```text
src/
  content/      JSON content + types.ts + index.ts (+ labels.ts for UI labels shared by site and deck)
  components/   Header, Nav, Home, Pager, Sections (one component per page), Diagrams, diagramData,
                Illustrations, QrCode, ContextMeter, Quiz, PromptBuilder, Checklist, RichText, ui, confetti, ThemeMenu
  presenter/    deck.ts (builds slides from content), Slide.tsx, Presenter.tsx, controls.ts, presenter.css
  router.ts, theme.ts, styles.css, App.tsx, main.tsx
prompts/build-this-app.md   this prompt
README.md, VERIFY.md, docs/PROGRESS.md
```

## Content model

Every item shares `id`, `title`, `body`, `tags`, optional `sourceUrl` and `verify`. Files:

- `meta.json`: product name, headline, tagline (no AI jargon: it opens the deck), closing line, company, owner, end users, demo audience, reading speed (words per minute), last reviewed date, policy link, version note, `repoUrl`, `buildPrompt` (path of this file), `siteUrl` (empty means “use the current page”).
- `sections.json`: id, nav label, title, intro for each section, in order.
- `glossary.json`: every AI or tooling word the guide uses, in three groups (`ai`, `copilot`, `code`). Each has a one-line `short`, a plain-English `body`, an everyday `analogy`, and `match`: regular expressions that detect the word in any text (matched at the start of a word; `caseSensitive` for things like `Auto` and `PR`). Cover at least: AI model, reasoning model, prompt, context, token, context window, chat history, agent, tool, hallucination, AI credits, Auto (model), inline suggestion, inline chat, slash command, # mention, @ participant, instruction file, prompt file, front matter, applyTo glob, custom agent, agent skill, compaction, checkpoint, tool approval, sandbox, MCP server, content exclusion, code referencing, cloud agent, diff, repository, commit, pull request, terminal, CI check, merge conflict. Watch for false matches (“mental model”, “AI tools” in the plain-English sense, “toolbar”, “global”).
- `opening.json`: the opening story (see section 1).
- `context.json`, `modes.json`, `commands.json`, `workflow.json` (steps, long-chat decisions, checklist), `rules.json` (do’s and don’ts by group), `memory.json`, `templates.json`, `quiz.json`, `meter.json`, `security.json`, `beyond.json`, `facts.json` (“Did you know?”, each tied to a section and a source), `summary.json` (wrap-up takeaways, each linking a section), `promptCost.json` (two scenarios with per-round token numbers, plus the prompt anatomy).
- `diagrams.json`: data for every diagram below, so wording and numbers change without touching React.
- `talk.json`: the default slide ids for the short live talk.
- `stories.json`: keyed by slide id. Every slide names a `scene` (its picture). Section openers add a one-line `hook`. Teaching slides add `helps` and `wrong` (see presenter mode).
- `finale.json`: the words on the surprise ending.

Write `index.ts` helpers: `termsIn(text)`, `textOf(value)` (collects every human-readable string in a value, skipping ids, links and flags), `pageTerms(sectionId)` (glossary terms used anywhere on a page: title, intro, its content, its diagrams and its facts) and a flat search index.

## The site

- Top bar: product name, search (press `/`; results jump to the item’s page), **Present** button (opens the deck at the current section), theme menu. Side nav with numbered sections that becomes a drawer on narrow screens. Previous and next links at the foot of every page. A footer with owner, last reviewed and a **Print cheat sheet** button that prints the cheat sheet and the do’s and don’ts.
- Every section page has an eyebrow, title, intro, the section’s picture, and **Words on this page**: links to the Key terms definition of every glossary term used anywhere on that page. Each page ends with its “Did you know?” facts, each with a Source link.
- Home: headline, tagline, who it’s for (end users and demo audience), calls to action, and a numbered table of contents.

Sections, in order:

1. **Why it matters**: how one ordinary feature used to get built (searching forums and docs, writing boilerplate, writing tests, debugging, review and rework, roughly two days); the **Then and now** diagram; what the research says (Peng et al. 2023: 56% faster on a set task; Cui, Demirer et al. 2025: about 26% more completed tasks across 4,867 developers; Paradis et al. 2024: about 21% less time at Google) and the catch (METR July 2025: experienced developers 19% slower with early-2025 tools while believing they were 20% faster, noting METR’s 2026 follow-up; DORA 2024: 25% more AI adoption with 7.2% lower delivery stability and 1.5% lower throughput; Stack Overflow 2025: 84% use or plan to use AI, 46% distrust its accuracy vs 33% trust), every figure linked to its primary source; the five factors that decide which side you land on (focused context, clear prompts, the right mode, reviewing the output, keeping the cost down), each linking to its section; and the hand-over line “The rest of this session is how to be on the right side of that line.”
2. **Key terms**: the request-flow diagram (“what happens when you press Enter”), then the glossary in its three groups, each term with its analogy and source.
3. **How context works**: what fills the context window (history, attachments, instruction files, tool output, per-token billing, the context window control), the **Context stack** diagram and an interactive **context meter** (add actions, pick a model, see the window fill and the relative cost per model call).
4. **Prompt cost**: the snowball diagram (same bug, vague versus focused prompt, history re-sent each round, totals that count up) and the prompt anatomy (where, symptom, evidence, limits, done when) with a copy button.
5. **Chat modes**: Ask, Plan and Agent (Edit is deprecated), with the cost staircase diagram.
6. **Cheat sheet**: the **Prefixes** diagram, then slash commands, # context, @ participants, shortcuts (macOS or Windows toggle) and settings, each with a copy button and source.
7. **Daily workflow**: the **Daily loop** diagram, seven steps with “Try” prompts, the “when the chat gets long” flowchart and decision cards, and a daily checklist saved in the browser.
8. **Do’s and don’ts**: grouped by context and cost, prompting, reviewing and security, with a filter.
9. **Team memory**: instruction files, path-specific instructions, prompt files, custom agents, AGENTS.md and skills, each with an example file, plus a lanes diagram of which files ride along with which requests.
10. **Prompt templates**: copyable templates and a prompt builder.
11. **Test yourself**: a scenario quiz with explanations.
12. **Security**: the **Approval gate** diagram, then secrets, approvals, auto-approve, sandboxing, content exclusion and public code matches, and a pointer to the company AI policy.
13. **Beyond the editor**: commit messages, terminal inline chat, smart actions, Copilot code review and the cloud agent.
14. **Wrap-up**: seven takeaways, each linking back to its section, and an “I’m ready” button with confetti.

Small wins get confetti (a right quiz answer, a finished checklist, the end of the deck), never under reduced motion.

## Diagrams

Build them in HTML and CSS from `diagrams.json`, never as images. Each takes a `step` number: in the deck each press of → reveals one more part; on a page every part plays, staggered, once the diagram scrolls into view (IntersectionObserver). Each has a text alternative: real text in the markup, plus a visually hidden table where the picture is a chart (wrap hidden tables in a hidden `div`, because tables ignore `overflow: hidden`). Colours come from a colour-vision-safe categorical palette (`--dg-1` to `--dg-5`), stepped for dark mode; text always stays in text colours.

- **Request flow**: prompt → context packed → tokens → reply or tool call → results join the context, with the agent loop.
- **Snowball** and **prompt anatomy** (above), **modes staircase**, **long-chat flowchart**, **team memory lanes**.
- **Then and now**: one stacked bar of hours per way of working (before AI, AI used well, AI used carelessly), segments per activity, labelled illustrative, ending with the verdict that careless use feels fast, then pays it back in debugging and rework.
- **Context stack**: one column per prompt, stacked from instruction files, chat history, attached files, tool output and the prompt, with the history growing each time.
- **Daily loop**: the seven workflow steps around a circle that ends in “Commit, then clear” and loops back; a plain list below 520px of container width.
- **Approval gate**: the agent asks (shows the command), you check (allow once, for the session, or deny), then it runs; plus a warning that global auto-approve removes the gate.
- **Prefixes**: what `/`, `#` and `@` do in the chat box, each with an example typed into a mock input.

## Pictures

A shared set of about 28 small flat scenes in one component (`Illustrations.tsx`): desk, map, clock, rocket, fork in the road, book, whiteboard, snowball, target, roles, keyboard, loop, scales, folder, chat, question, shield, cloud, flag, bulb, magnifier, broom, gauge, gate, terminal, branch, stack, sparkle. Inline SVG on a 160 × 120 canvas, filled from the diagram palette and outlined in the text colour, so every scene follows the theme. Hidden from screen readers. Gentle, slow loops (float, sway, blink, draw), applied only to animated parts so static SVG transforms aren’t disturbed, all switched off under reduced motion. Two small avatars, **Asha** and **Ben**, for the stories.

## Presenter mode

`deck.ts` builds the slides from the content: title, agenda, then for each section an opener and its slides (cards, detail, table, steps, do/don’t compare, quiz, diagram, research figures, summary, statement, facts), then “Questions?” and the surprise ending. Split slides rather than shrink text: every slide must fit a 16:9 frame at 1280×720 and 800×600 without scrolling.

- **Picture and story on every slide.** Every slide shows its scene. Every teaching slide ends with a two-part story strip, revealed last: **How it helps** (what Asha does and what it gains) and **Wrong practice** (what Ben does and what it costs), each at most 30 words, always using the names, never pronouns. Title, agenda, section openers, quiz and closing slides get a picture only; openers also show the story hook. In development, warn in the console when a teaching slide has no story.
- **New words.** Walk the deck in order; the first slide whose text uses a glossary term shows a “New word” note with the term and its one-line definition (and any term that definition needs). Later slides don’t repeat it. Slides that define terms (the Key terms cards) need no note. No term may appear on a slide before it is defined.
- **Reveals.** → Space PgDn reveal the next point, then move on; ← Shift+Space PgUp go back; Home/End; O overview with every slide’s time to read; S short talk or full deck; F fullscreen; T next transition; D next slide design; B blank; ? shortcuts; Esc leaves to the current section’s page. Swipe on touch screens. The toolbar hides after a few idle seconds.
- **Short talk and full deck.** `talk.json` lists the slide ids to present live (about 25: the opening story, the key diagrams, three quiz scenarios, the approval gate, the takeaways and the finale). The presenter opens on the short talk; S or a toolbar picker switches to the full deck and back, staying on the same slide or moving to the next one in the talk, and remembers the choice. Each deck works out its own New word notes, quiz numbering and timings. The overview dims slides the talk skips; picking one switches to the full deck there. Nothing is removed from the guide. A "Choose slides" mode in the overview lets presenters tick slides in or out of the talk; the pick is saved in the browser, with Reset and a "Copy for talk.json" button.
- **Time to read** per slide (words shown when fully revealed ÷ words per minute, rounded up to 5 s) and the time left in the deck.
- **Transitions**: slide, fade, zoom, flip, page turn, cube, wipe, circle, rise, random.
- **Slide designs**, like presentation templates, chosen from a picker and remembered: Classic (accent bar), Bold (accent band and a big corner shape), Paper (warm, ruled, stitched border, serif titles), Blueprint (grid and corner marks), Spotlight (soft light from the corners). The slide sits on a darker stage with a shadow and has a footer with the product, section and slide number. Backgrounds stay near the surface colour so contrast holds.
- **The surprise ending.** After “Questions?”: a dark “One more thing…” slide; then the slide peels away like a page to show that it was never a slide deck, with live numbers counted from the app itself (slides, diagrams, pictures, content files via `import.meta.glob`, glossary terms, facts) counting up one per key press; then live controls on the slide itself (colour, appearance, slide design, transition) plus a QR code to open the guide on a phone; then “One prompt can build this app” linking to this file on GitHub with a QR code; and last, “Thank you for your patience”. The peel is a copy of the “One more thing…” slide, plays only when moving forward, and never replays in the copy of the slide that animates out. QR codes are drawn as SVG, black on white. Confetti on the last slide.

## Themes

Appearance (system, light, dark) plus six accent palettes (teal, ocean, grape, rose, ember, graphite), each passing WCAG AA in both appearances, set with `data-theme` and `data-palette` on `<html>` and `light-dark()`. Theme changes reveal as a growing circle from the click point with the View Transitions API, where supported and motion is allowed. Choices are saved in `localStorage`, always wrapped in try/catch.

## Done when

- `npm run lint` and `npm run build` pass.
- Every slide has a picture and every teaching slide has a story, with no development warnings.
- No page scrolls sideways at 360, 768 or 1280px, and every slide fits at 1280×720 and 800×600.
- No term appears on a slide before it is defined.
- README explains running, hosting, presenting and editing content; VERIFY.md lists anything unconfirmed; docs/PROGRESS.md records the decisions.
