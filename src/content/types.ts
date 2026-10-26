// Every piece of guide content shares these fields so search, source links and
// "needs verification" badges work the same way everywhere.
export interface Item {
  id: string
  title: string
  body: string
  tags: string[]
  sourceUrl?: string
  verify?: boolean
}

export interface Meta {
  product: string
  headline: string
  tagline: string
  // Last line of the presenter deck.
  closing: string
  company: string
  owner: string
  // Who uses the app day to day.
  endUsers: string
  // Who the live demo or presentation is for.
  demoAudience: string
  // Reading speed used for each slide's "time to read" estimate.
  readingWordsPerMinute: number
  lastReviewed: string
  policyUrl: string
  copilotVersionNote: string
  // Where the source lives, for the deck's last slide. The build prompt path is relative to it.
  repoUrl: string
  buildPrompt: string
  // Public address of the guide for the "open it on your phone" QR code. Empty: use the current page.
  siteUrl: string
}

export interface SectionInfo {
  id: string
  nav: string
  title: string
  intro: string
}

export interface ContextSource extends Item {
  example: string
}

export interface Mode extends Item {
  useWhen: string
  example: string
}

export type CommandGroup = 'slash' | 'participant' | 'context' | 'shortcut' | 'setting'

export interface Command extends Item {
  group: CommandGroup
  code: string
  mac?: string
  win?: string
}

export interface WorkflowStep extends Item {
  prompt?: string
}

export interface Decision extends Item {
  action: 'new-chat' | 'summarise' | 'continue'
  signals: string[]
}

export type RuleGroup = 'Context & cost' | 'Prompting' | 'Reviewing' | 'Security'

export interface Rule extends Item {
  kind: 'do' | 'dont'
  group: RuleGroup
}

export interface MemoryFile extends Item {
  path: string
  when: string
  example: string
}

export interface Template extends Item {
  mode: string
  prompt: string
}

export interface ChecklistItem {
  id: string
  label: string
  phase: 'Start' | 'During' | 'Finish'
}

export interface QuizOption {
  text: string
  correct: boolean
}

export interface QuizQuestion {
  id: string
  scenario: string
  options: QuizOption[]
  why: string
  tags: string[]
}

export type MeterKind = 'instructions' | 'history' | 'files' | 'tools'

export interface MeterAction {
  id: string
  label: string
  detail: string
  kind: MeterKind
  tokens: number
  // Model calls this action makes. Each call re-sends the whole context, so it is billed on all of it.
  calls: number
  drift?: boolean
}

export interface ModelTier {
  id: string
  label: string
  // Illustrative price per token relative to a standard model.
  relativeCost: number
}

// "Did you know?" facts, shown on their section's page and as a slide after that section.
export interface FunFact extends Item {
  section: string
}

// One line of the wrap-up, linking back to the section with the detail.
export interface Takeaway extends Item {
  section: string
}

// ---------- Prompt cost ----------
export interface PromptRound {
  you: string
  copilot: string
  // Tokens this round adds: the prompt, anything attached or pasted, and tool output.
  added: number
  // Tokens in Copilot's reply. It joins the history for the next round.
  reply: number
}

export interface PromptScenario {
  id: string
  label: string
  prompt: string
  outcome: string
  rounds: PromptRound[]
}

export type PromptPartKind = 'where' | 'symptom' | 'evidence' | 'limits' | 'done'

export interface PromptPart {
  kind: PromptPartKind
  label: string
  text: string
}

// ---------- Diagrams on the section pages and in the deck ----------
export interface ModeRung {
  mode: string
  does: string
  changes: string
  cost: string
}

export interface FlowQuestion {
  question: string
  yes: Decision['action']
  yesDetail: string
}

export interface MemoryLane {
  label: string
  files: { name: string; on: boolean[] }[]
}

// Plain-English definitions for people new to AI.
export type TermGroup = 'ai' | 'copilot' | 'code'

export interface GlossaryTerm extends Item {
  group: TermGroup
  // One line, used in tooltips, the term links on each page and the deck's "New word" notes.
  short: string
  analogy: string
  // Patterns that mean a piece of text uses this term: regular expressions, matched at the start
  // of a word when they begin with a letter. Any case, unless caseSensitive is set.
  match: string[]
  caseSensitive?: boolean
}

// ---------- Opening story ----------
export interface Finding extends Item {
  // The headline number, as shown: "56%".
  figure: string
  source: string
}

export interface Factor extends Item {
  // The section that teaches this habit.
  section: string
}

export interface Opening {
  feature: string
  then: Item[]
  thenNote: string
  research: Finding[]
  catch: Finding[]
  factors: Factor[]
  handover: string
}

// ---------- Pictures and stories ----------
// The shared set of illustrations, drawn in src/components/Illustrations.tsx.
export type SceneId =
  | 'desk'
  | 'map'
  | 'clock'
  | 'rocket'
  | 'fork'
  | 'book'
  | 'whiteboard'
  | 'snowball'
  | 'target'
  | 'roles'
  | 'keyboard'
  | 'loop'
  | 'scales'
  | 'folder'
  | 'chat'
  | 'question'
  | 'shield'
  | 'cloud'
  | 'flag'
  | 'bulb'
  | 'magnifier'
  | 'broom'
  | 'gauge'
  | 'gate'
  | 'terminal'
  | 'branch'
  | 'stack'
  | 'sparkle'

// Keyed by slide id. Teaching slides tell a two-line story; openers get a one-line hook.
export interface SlideStory {
  scene: SceneId
  hook?: string
  // What Asha does and what it gains (the habit).
  helps?: string
  // What Ben does and what it costs (the trap).
  wrong?: string
}

export interface ThenNow {
  scenarios: { id: 'before' | 'well' | 'careless'; label: string }[]
  // Hours per scenario, in the same order as `scenarios`.
  activities: { label: string; hours: number[] }[]
  unit: string
  verdict: string
  note: string
}

export type StackKind = 'instructions' | 'history' | 'files' | 'tools' | 'prompt'

export interface ContextStack {
  kinds: { id: StackKind; label: string }[]
  // Each request lists what rides along with it, in tokens (illustrative).
  requests: { label: string; blocks: { kind: StackKind; tokens: number }[] }[]
  note: string
}

export interface DailyLoop {
  centre: string
  // Short labels for the seven workflow steps; the last one closes the loop.
  steps: string[]
  back: string
}

export interface ApprovalGate {
  ask: { title: string; body: string; command: string }
  check: { title: string; body: string; options: string[] }
  run: { title: string; body: string }
  bypass: string
}

export interface Prefix {
  key: string
  name: string
  does: string
  example: string
}

export interface RequestFlow {
  // `show` adds the packed context or the token split under a step.
  steps: { title: string; body: string; show?: 'packed' | 'tokens' }[]
  packed: string[]
  tokens: string[]
  tokensNote: string
  loop: string
}
