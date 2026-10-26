# Content revision: story, pictures, plain words and a surprise ending

Read this before changing any content. Follow the repo rules in `.github/copilot-instructions.md` (sources, typed content in `src/content/`, no hard-coded content in components, WCAG 2.2 AA, reduced motion, 360px to wide, light and dark).

The audience has only just started using AI at work. Assume they know how to code. Assume they know nothing about AI words.

## 1. No undefined words

- Every AI or tooling term shown on a page or slide is either plain English or defined in `src/content/glossary.json`.
- Audit all content for jargon. At minimum decide on: MCP, agent, tool, token, context window, model, reasoning model, Auto (model), prompt file, instruction file, front matter, `applyTo` / glob, slash command, `#` context, `@` participant, diff, pull request, repository, commit, terminal, CI check, sandbox, content exclusion, code referencing, checkpoint, merge conflict, hallucination. For each one: define it in the glossary, or rewrite the sentence so it isn't needed.
- Deck: the first slide that uses a glossary term shows a "New word" note with its one-line definition. Later slides don't repeat it.
- Site: every page lists the glossary terms used anywhere on that page, not only in its intro, linking to Key terms.

## 2. Every slide has a picture and a story

- Every slide shows an illustration: an inline SVG scene from a shared set, coloured from the diagram palette, gently animated, hidden from screen readers. No external images, no CDNs.
- Every teaching slide has a two-line story told through two recurring developers, **Asha** (the habit) and **Ben** (the trap). Use their names, never pronouns.
  - **How it helps**: what Asha does and what it gains. One or two sentences, at most 30 words.
  - **Wrong practice**: what Ben does and what it costs. One or two sentences, at most 30 words.
- Stories and picture choices live in `src/content/stories.json`, keyed by slide id. The deck warns in development when a teaching slide has no story.
- Title, agenda, section openers, quiz and closing slides get a picture. Section openers also get a one-line story hook.
- Every slide still fits a 16:9 frame at 1280×720 and 800×600 without scrolling. Split slides rather than shrink text.
- Check the slide background designs. Maintai a theme. Should look like a power point presentation. Apply a theme/design picker.

## 3. Diagrams wherever they help

Keep the existing diagrams. Add:

- **Then and now**: time spent on one feature before AI, with AI used well, and with AI used carelessly (illustrative hours, labelled).
- **Context stack**: what goes on the whiteboard with each request, growing as the chat goes on.
- **Daily loop**: the seven workflow steps as a loop that ends in "commit, then clear".
- **Approval gate**: the agent asks, you check, then it runs.
- **Prefixes**: what `/`, `#` and `@` do in the chat box.

Each diagram is data-driven from `src/content/diagrams.json`, reveals one part per key press in the deck, animates on scroll on the site, and has a text alternative.

## 4. A surprise ending

After "Questions?", the deck reveals that it was never a slide deck:

- "One more thing…", then the slide frame peels away to show live numbers computed from the app itself: slides, diagrams, content files, glossary terms, facts.
- Show that it is live: switch the colour theme and the transition from the slide, and invite people to open it on their phones with a QR code.
- Close with "One prompt can build this app", linking to `prompts/build-this-app.md` on GitHub, with a QR code.
- `prompts/build-this-app.md` is a single self-contained prompt that recreates the app: stack, structure, content model, every section, presenter mode, diagrams, themes and accessibility rules.

## 5. Open with a story

The guide and the deck start with a new first section, before Key terms:

- How a feature used to get built: searching forums and docs, writing boilerplate, writing tests, debugging, reviewing. Roughly how long that took.
- How AI makes it faster, with verified research figures and their sources.
- The catch: the gains only come when AI is used well. Careless use can make experienced developers slower while they feel faster. Name the factors that decide which: focused context, clear prompts, the right mode, reviewing the output, and keeping the cost down.
- End the section by handing over to the rest of the guide: "the rest of this session is how to be on the right side of that line".

## Done when

- `npm run lint` and `npm run build` pass.
- Every slide has a picture; every teaching slide has a story (no development warnings).
- An overflow check at 360/768/1280px finds nothing on any page, and every slide fits at 1280×720 and 800×600.
- No term appears on a slide before it is defined.
- README, PROGRESS and VERIFY are updated.
