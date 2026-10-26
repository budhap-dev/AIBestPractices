// Single entry point for all guide content. Edit the JSON files, not this one.
import metaJson from './meta.json'
import sectionsJson from './sections.json'
import contextJson from './context.json'
import modesJson from './modes.json'
import commandsJson from './commands.json'
import workflowJson from './workflow.json'
import rulesJson from './rules.json'
import memoryJson from './memory.json'
import templatesJson from './templates.json'
import quizJson from './quiz.json'
import meterJson from './meter.json'
import securityJson from './security.json'
import beyondJson from './beyond.json'
import factsJson from './facts.json'
import summaryJson from './summary.json'
import promptCostJson from './promptCost.json'
import diagramsJson from './diagrams.json'
import glossaryJson from './glossary.json'
import openingJson from './opening.json'
import storiesJson from './stories.json'
import finaleJson from './finale.json'
import talkJson from './talk.json'
import type {
  ApprovalGate,
  ChecklistItem,
  ContextStack,
  DailyLoop,
  Command,
  ContextSource,
  Decision,
  FlowQuestion,
  FunFact,
  GlossaryTerm,
  Item,
  MemoryFile,
  MemoryLane,
  Meta,
  MeterAction,
  Mode,
  ModeRung,
  ModelTier,
  Opening,
  Prefix,
  PromptPart,
  PromptScenario,
  RequestFlow,
  QuizQuestion,
  Rule,
  SectionInfo,
  SlideStory,
  Takeaway,
  ThenNow,
  Template,
  WorkflowStep,
} from './types'

export const meta = metaJson as Meta
export const sections = sectionsJson as SectionInfo[]
export const contextSources = contextJson as ContextSource[]
export const modes = modesJson as Mode[]
export const commands = commandsJson as Command[]
export const workflow = workflowJson as {
  steps: WorkflowStep[]
  decisions: Decision[]
  checklist: ChecklistItem[]
}
export const rules = rulesJson as Rule[]
export const memoryFiles = memoryJson as MemoryFile[]
export const templates = templatesJson as Template[]
export const quiz = quizJson as QuizQuestion[]
export const meter = meterJson as {
  capacity: number
  baseline: number
  actions: MeterAction[]
  models: ModelTier[]
}
export const security = securityJson as Item[]
export const beyond = beyondJson as Item[]
export const facts = factsJson as FunFact[]
export const takeaways = summaryJson as Takeaway[]
export const promptCost = promptCostJson as {
  note: string
  instructions: number
  scenarios: PromptScenario[]
  anatomy: PromptPart[]
}
export const glossary = glossaryJson as GlossaryTerm[]
export const diagrams = diagramsJson as {
  request: RequestFlow
  modes: ModeRung[]
  chatFlow: { start: string; questions: FlowQuestion[]; otherwise: Decision['action']; otherwiseDetail: string }
  memory: { requests: string[]; lanes: MemoryLane[]; note: string }
  thenNow: ThenNow
  contextStack: ContextStack
  dailyLoop: DailyLoop
  approvalGate: ApprovalGate
  prefixes: Prefix[]
}
export const opening = openingJson as Opening
export const stories = storiesJson as Record<string, SlideStory>
export const finale = finaleJson
// The slides to present in a short live session; the full deck keeps everything.
export const talk = talkJson as { label: string; note: string; slides: string[] }

export function section(id: string): SectionInfo {
  const found = sections.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown section "${id}" in sections.json`)
  return found
}

// Each term's patterns, compiled once. A pattern that starts with a letter must match at the start of a word.
const termPatterns = new Map(glossary.map((t) => [t.id, t.match.map((m) => new RegExp(`${/^\w/.test(m) ? '\\b' : ''}${m}`, t.caseSensitive ? '' : 'i'))]))

export const usesTerm = (text: string, term: GlossaryTerm) => termPatterns.get(term.id)!.some((re) => re.test(text))

// Glossary terms a piece of text uses, in glossary order.
export function termsIn(text: string): GlossaryTerm[] {
  return glossary.filter((t) => usesTerm(text, t))
}

// Every string inside a value, skipping keys that hold ids, links or flags rather than words people read.
const NOT_TEXT = new Set(['id', 'section', 'kind', 'group', 'tags', 'sourceUrl', 'verify', 'match', 'action', 'yes', 'otherwise', 'phase', 'show', 'mode', 'correct', 'scene'])

export function textOf(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(textOf)
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => (NOT_TEXT.has(k) ? [] : textOf(v)))
  return []
}

// What each guide page shows, beyond its title and intro, so its term links cover the whole page.
const PAGE_CONTENT: Record<string, unknown[]> = {
  why: [opening, diagrams.thenNow],
  'key-terms': [],
  'mental-model': [contextSources, diagrams.contextStack, meter.actions.map((a) => [a.label, a.detail]), meter.models.map((m) => m.label)],
  'prompt-cost': [promptCost.scenarios, promptCost.anatomy, promptCost.note],
  modes: [modes, diagrams.modes],
  'cheat-sheet': [commands, diagrams.prefixes],
  workflow: [workflow, diagrams.dailyLoop, diagrams.chatFlow],
  'dos-donts': [rules],
  'team-memory': [memoryFiles, diagrams.memory],
  templates: [templates],
  quiz: [quiz],
  security: [security, diagrams.approvalGate],
  beyond: [beyond],
  'wrap-up': [takeaways],
}

// Glossary terms used anywhere on a section's page. The Key terms page defines them all, so it lists none.
export function pageTerms(id: string): GlossaryTerm[] {
  if (id === 'key-terms') return []
  const info = section(id)
  const own = facts.filter((f) => f.section === id)
  return termsIn(textOf([info.title, info.intro, PAGE_CONTENT[id] ?? [], own]).join('\n'))
}

export interface SearchEntry {
  id: string
  title: string
  text: string
  sectionId: string
  sectionNav: string
}

// Flat list of everything searchable, each pointing at the element id it renders with.
export const searchIndex: SearchEntry[] = (() => {
  const entries: SearchEntry[] = []
  const add = (sectionId: string, list: { id: string; title: string; body?: string; tags?: string[] }[], extra?: (i: never) => string) => {
    const nav = section(sectionId).nav
    for (const i of list) {
      entries.push({
        id: i.id,
        title: i.title,
        text: [i.title, i.body ?? '', ...(i.tags ?? []), extra ? extra(i as never) : ''].join(' ').toLowerCase(),
        sectionId,
        sectionNav: nav,
      })
    }
  }
  add('mental-model', contextSources)
  add('modes', modes)
  add('cheat-sheet', commands, (c: Command) => `${c.code} ${c.group}`)
  add('workflow', workflow.steps)
  add('workflow', workflow.decisions)
  add('dos-donts', rules, (r: Rule) => `${r.kind === 'do' ? 'do' : "don't"} ${r.group}`)
  add('team-memory', memoryFiles, (m: MemoryFile) => m.path)
  add('templates', templates, (t: Template) => t.prompt)
  add('security', security)
  add('beyond', beyond)
  add('wrap-up', takeaways)
  add('why', [...opening.then, ...opening.research, ...opening.catch, ...opening.factors])
  add('key-terms', glossary, (t: GlossaryTerm) => `${t.short} ${t.analogy}`)
  for (const f of facts) add(f.section, [f])
  for (const s of sections) {
    entries.push({ id: s.id, title: s.title, text: `${s.title} ${s.nav} ${s.intro}`.toLowerCase(), sectionId: s.id, sectionNav: s.nav })
  }
  return entries
})()
