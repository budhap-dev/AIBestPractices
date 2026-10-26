import { useState } from 'react'
import { quiz } from '../content'
import { celebrate } from './confetti'

export function Quiz() {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const finished = index >= quiz.length

  if (finished) {
    const great = score >= quiz.length - 1
    return (
      <div className="quiz card">
        <p className="eyebrow">Result</p>
        <h3>
          {score} / {quiz.length} {great ? 'Nicely done.' : 'Worth another look.'}
        </h3>
        <p className="muted">
          {great ? 'You have the habits. Share the cheat sheet with someone newer to Copilot.' : 'Revisit the context meter and the do’s and don’ts, then try again.'}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setIndex(0)
            setPicked(null)
            setScore(0)
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  const q = quiz[index]
  const answered = picked !== null

  function pick(i: number, button: HTMLButtonElement) {
    if (answered) return
    setPicked(i)
    if (!q.options[i].correct) return
    setScore((s) => s + 1)
    celebrate({ from: button })
  }

  return (
    <div className="quiz card" id={q.id}>
      <div className="quiz__top">
        <p className="eyebrow">
          Scenario {index + 1} of {quiz.length}
        </p>
        <span className="quiz__score">Score {score}</span>
      </div>
      <div className="quiz__progress" aria-hidden="true">
        <span style={{ width: `${(index / quiz.length) * 100}%` }} />
      </div>
      <h3 className="quiz__q">{q.scenario}</h3>
      <div className="quiz__options" role="group" aria-label="Answers">
        {q.options.map((o, i) => {
          const state = !answered ? '' : o.correct ? ' is-correct' : i === picked ? ' is-wrong' : ' is-dim'
          return (
            <button key={i} type="button" className={`quiz__opt${state}`} onClick={(e) => pick(i, e.currentTarget)} aria-pressed={picked === i} disabled={answered && i !== picked && !o.correct}>
              <span className="quiz__letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              {o.text}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="quiz__why" role="status">
          <strong>{q.options[picked].correct ? 'Correct.' : 'Not quite.'}</strong> {q.why}
        </div>
      )}
      <div className="quiz__nav">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!answered}
          onClick={() => {
            // A strong finish gets the big celebration.
            if (index === quiz.length - 1 && score >= quiz.length - 1) celebrate({ size: 'big' })
            setIndex((i) => i + 1)
            setPicked(null)
          }}
        >
          {index === quiz.length - 1 ? 'See result' : 'Next scenario'}
        </button>
      </div>
    </div>
  )
}
