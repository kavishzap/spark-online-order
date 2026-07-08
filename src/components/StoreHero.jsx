import { useEffect, useRef, useState } from 'react'

// const HERO_IMAGE_SRC = '/hero.png'

const HERO_VIDEO_SRC = '/hero.mp4?v=1'

export default function StoreHero() {
  const videoRef = useRef(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const enableSound = () => {
      video.muted = false
      video.volume = 1
      setIsMuted(false)
      video.play().catch(() => {})
    }

    const startPlayback = async () => {
      video.volume = 1
      video.muted = false

      try {
        await video.play()
        setIsMuted(false)
      } catch {
        video.muted = true
        setIsMuted(true)
        await video.play().catch(() => {})
      }
    }

    const onUserInteraction = () => {
      if (video.muted) enableSound()
    }

    startPlayback()
    video.addEventListener('canplay', startPlayback)

    window.addEventListener('pointerdown', onUserInteraction, { once: true })

    return () => {
      video.removeEventListener('canplay', startPlayback)
      window.removeEventListener('pointerdown', onUserInteraction)
    }
  }, [])

  const handleUnmute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.volume = 1
    setIsMuted(false)
    video.play().catch(() => {})
  }

  return (
    <section className="store-hero" aria-label="Spark Mauritius Order Platform showcase">
      <video
        ref={videoRef}
        className="store-hero__video"
        autoPlay
        loop
        playsInline
        preload="auto"
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      {isMuted && (
        <button
          type="button"
          className="store-hero__sound-btn"
          onClick={handleUnmute}
          aria-label="Turn on sound"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="m22 9-6 6M16 9l6 6" />
          </svg>
          Tap for sound
        </button>
      )}

      {/* Image hero — restore when needed
      <img
        src={HERO_IMAGE_SRC}
        alt="Spark Mauritius Order Platform"
        className="store-hero__image"
      />
      */}
    </section>
  )
}
