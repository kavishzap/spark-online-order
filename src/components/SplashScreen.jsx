import { useEffect, useState } from 'react'

const LOGO_SRC = '/logo.png'
const MIN_DISPLAY_MS = 1600
const FADE_OUT_MS = 650

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const startedAt = Date.now()
    let fadeTimer
    let finishTimer
    let fallbackTimer

    const beginExit = () => {
      const elapsed = Date.now() - startedAt
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed)

      fadeTimer = window.setTimeout(() => {
        setPhase('exit')
        finishTimer = window.setTimeout(() => {
          onFinish?.()
        }, FADE_OUT_MS)
      }, wait)
    }

    if (document.readyState === 'complete') {
      beginExit()
    } else {
      window.addEventListener('load', beginExit, { once: true })
      fallbackTimer = window.setTimeout(beginExit, 3200)
    }

    return () => {
      window.removeEventListener('load', beginExit)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(finishTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [onFinish])

  return (
    <div
      className={`splash${phase === 'exit' ? ' splash--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Spark Mauritius Order Platform"
    >
      <div className="splash__content">
        <img src={LOGO_SRC} alt="Spark Mauritius Order Platform" className="splash__logo" />

        <div className="splash__loader" aria-hidden="true">
          <span className="splash__loader-bar" />
        </div>
      </div>
    </div>
  )
}
