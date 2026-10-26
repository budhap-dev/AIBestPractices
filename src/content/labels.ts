// UI labels shared by the guide pages and the presenter deck.
import type { CommandGroup, Decision, RuleGroup } from './types'

export const GROUPS: { id: CommandGroup; label: string }[] = [
  { id: 'slash', label: 'Slash commands' },
  { id: 'context', label: '# context' },
  { id: 'participant', label: '@ participants' },
  { id: 'shortcut', label: 'Shortcuts' },
  { id: 'setting', label: 'Settings & views' },
]

export const ACTION_LABEL: Record<Decision['action'], string> = { 'new-chat': 'Start a new chat', summarise: 'Summarise and continue', continue: 'Keep going' }

export const RULE_GROUPS: RuleGroup[] = ['Context & cost', 'Prompting', 'Reviewing', 'Security']
