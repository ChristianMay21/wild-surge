'use client'
import styles from './main.module.css'
import { useEffect, useRef, useState } from 'react'

interface MainProps {
  surgeTable: string[]
}

enum SurgeType {
  NoSurge,
  Helpful,
  Neutral,
  Harmful,
  Chaotic,
}

interface Surge {
  text: string
  surgeType: SurgeType
}

declare global {
  interface Window {
    test: any
    test0: any
    test1: any
  }
}

export default function Main(props: MainProps) {
  const [surgeProbability, setSurgeProbability] = useState(0.05)
  const [tidesDisabled, setTidesDisabled] = useState(false)
  const [surgeEffect, setSurgeEffect] = useState('Chaos comes.')
  const [surgeTextDelay, setSurgeTextDelay] = useState(false)
  const [surgeType, setSurgeType] = useState<SurgeType>(SurgeType.NoSurge)
  const [prevSurges, setPrevSurges] = useState<Surge[]>([])
  const [currentSurgeIndex, setCurrentSurgeIndex] = useState(-1)
  const surgeSound = useRef<HTMLAudioElement | null>(null)
  const noSurgeSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create an Audio object when the component mounts
    surgeSound.current = new Audio('/surge-sound.wav')
    noSurgeSound.current = new Audio('/no-surge-sound.wav')
  }, [])

  const playSurgeSound = (): void => {
    if (surgeSound.current) {
      surgeSound.current
        .play()
        .catch((error: Error) => console.error('Error playing sound:', error))
    }
  }

  const playNoSurgeSound = (): void => {
    if (noSurgeSound.current) {
      noSurgeSound.current
        .play()
        .catch((error: Error) => console.error('Error playing sound:', error))
    }
  }

  async function handleSurgeClick() {
    const surgeOccurs = Math.random() < surgeProbability
    setSurgeTextDelay(true)
    setTimeout(async () => {
      setSurgeTextDelay(false)
      if (surgeOccurs) {
        playSurgeSound()
        setSurgeEffect('The wild magic surges...')
        await activateSurgeEffect()
        setSurgeProbability(0.05)
        setTidesDisabled(false)
      } else {
        playNoSurgeSound()
        setSurgeEffect('The wild magic waits.')
        setSurgeType(SurgeType.NoSurge)
        setSurgeProbability((surgeProbability) => surgeProbability + 0.05)
      }
    }, 750)
  }

  function handleTidesClick() {
    setSurgeProbability(1)
  }

  async function getSurgeResult(promptType: 'helpful' | 'neutral' | 'harmful' | 'chaotic') {
    const response = await fetch('/generate-surge?promptType=' + promptType)
    if (response.status < 300) {
      let data = await response.json()
      let message = await data.message
      return message
    } else {
      setSurgeType(SurgeType.Neutral)
      setSurgeEffect(
        [
          '...any second now...',
          "...it's coming, I promise...",
          '...Slight delay. Who coded this shit, anyways?',
          '...the sorcerer jumps up and down a bit. Is this thing on?',
          '...is it actually a wild magic surge, or does he just have gas?',
          '...the Weave is a bit tangled right now...',
          "...while we wait, what if two of the characters kissed?",
          "...plumbing's a bit clogged. Might want to try some fiber...",
          "...if you could go back in time, would you kill baby BBEG?..",
          "...in the mean time, a Tarrasque spawns. (Just kidding)..."
        ][Math.floor(Math.random() * 10)],
      )
      return await getSurgeResult(promptType)
    }
  }

  async function activateSurgeEffect() {
    const randomRoll = Math.random()
    let promptType: 'helpful' | 'neutral' | 'harmful' | 'chaotic'
    let surgeType: SurgeType = SurgeType.Neutral
    if (randomRoll < 0.35) {
      promptType = 'helpful'
      surgeType = SurgeType.Helpful
    } else if (randomRoll < 0.6) {
      promptType = 'neutral'
      surgeType = SurgeType.Neutral
    } else if (randomRoll < 0.8) {
      promptType = 'harmful'
      surgeType = SurgeType.Harmful
    } else {
      promptType = 'chaotic'
      surgeType = SurgeType.Chaotic
    }

    setSurgeType(surgeType)

    try {
      const message = await getSurgeResult(promptType)
      setSurgeTextDelay(true)
      setTimeout(async () => {
        setSurgeTextDelay(false)
        setSurgeEffect(message)
        setPrevSurges((prevSurges) => [...prevSurges, { text: message, surgeType: surgeType }])
        setCurrentSurgeIndex(prevSurges.length)
      }, 750)
    } catch (error) {
      setSurgeEffect('An error occurred: ' + error)
    }
  }

  function leftHandler() {
    if (currentSurgeIndex > 0) {
      setSurgeEffect(prevSurges[currentSurgeIndex - 1].text)
      setSurgeType(prevSurges[currentSurgeIndex - 1].surgeType)
      setCurrentSurgeIndex((currentSurgeIndex) => currentSurgeIndex - 1)
    }
  }

  function rightHandler() {
    if (!(currentSurgeIndex === prevSurges.length - 1)) {
      setSurgeEffect(prevSurges[currentSurgeIndex + 1].text)
      setSurgeType(prevSurges[currentSurgeIndex + 1].surgeType)
      setCurrentSurgeIndex((currentSurgeIndex) => currentSurgeIndex + 1)
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.surgeTableHeadingContainer}>
        <h2 className={styles.heading}>Surge Table</h2>
      </div>
      <div className={styles.surgeEffectContainer} data-surge-type={surgeType}>
        {surgeTextDelay ? <></> : <p className={styles.surgeEffect}>{surgeEffect}</p>}
      </div>
      <div className={styles.arrowContainer}>
        <button className={styles.leftArrow} disabled={currentSurgeIndex < 1} onClick={leftHandler}>
          Previous
        </button>
        <button
          className={styles.rightArrow}
          disabled={currentSurgeIndex === prevSurges.length - 1}
          onClick={rightHandler}
        >
          Next
        </button>
      </div>
      <div className={styles.surgeChanceContainer}>
        <h2 className={styles.heading}>Chance of Surge Effect</h2>
        <div className={styles.surgeChanceNumberContainer}>
          <span className={styles.surgeChanceNumber}>{Math.round(surgeProbability * 100)}%</span>
        </div>
      </div>
      <div className={styles.buttonRow}>
        <div className={styles.tidesContainer}>
          <div className={styles.tidesButton}></div>
          <button className={styles.tidesLabel} onClick={handleTidesClick} disabled={tidesDisabled}>
            Tides of Chaos
          </button>
        </div>
        <div className={styles.surgeContainer}>
          <div className={styles.surgeButton}></div>
          <button className={styles.surgeLabel} onClick={handleSurgeClick}>
            Surge
          </button>
        </div>
      </div>
    </div>
  )
}
