import { Fragment, type ReactNode } from 'react'

// Content is plain text, so code-like tokens are found by pattern and styled on the slide:
// slash commands, #context, @participants, file names and paths, settings ids, npm commands and shortcuts.
const KEYS = String.raw`(?:[⌘⇧⌥⌃]\+?)+[A-Z0-9\[\]]|\b(?:Ctrl|Cmd|Alt|Shift)(?:\+(?:Ctrl|Cmd|Alt|Shift|Enter|Space|Tab|Right|Left|Up|Down|[A-Z0-9]))+`
const CODE = [
  String.raw`(?<![\w/])/[a-z<][\w<>-]*`, // /clear, /create-prompt, /<prompt-name>
  String.raw`(?<![\w&])#[a-zA-Z](?:[\w-]|\.(?=\w))*`, // #problems, #refresh.ts
  String.raw`(?<=\s)#(?=[\s,.])`, // a lone "#"
  String.raw`(?<![\w])@[a-z]\w*`, // @vscode
  String.raw`\.github/[\w/*.-]*`, // .github/prompts/*.prompt.md
  String.raw`[\w*./-]*\.(?:md|tsx?|jsx?|json|ya?ml)\b`, // AGENTS.md, src/lib/log.ts
  String.raw`(?<![\w])\.env\b`,
  String.raw`\b[a-z]+(?:\.[a-zA-Z]+){2,}\b(?<!\.(?:com|org|io|net))`, // chat.tools.global.autoApprove
  String.raw`\bnpm (?:run )?[\w:-]+`,
].join('|')

const TOKEN = new RegExp(`(${KEYS})|(${CODE})`, 'g')

export function RichText({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0
    if (at > last) parts.push(text.slice(last, at))
    parts.push(m[1] ? <kbd className="rich-kbd">{m[0]}</kbd> : <code className="rich-code">{m[0]}</code>)
    last = at + m[0].length
  }
  if (last === 0) return text
  if (last < text.length) parts.push(text.slice(last))
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)
}
