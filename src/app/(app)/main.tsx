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

export default function Main(props: MainProps) {
  const [surgeProbability, setSurgeProbability] = useState(0.05)
  const [tidesDisabled, setTidesDisabled] = useState(false)
  const [surgeEffect, setSurgeEffect] = useState('Chaos comes.')
  const [surgeTextDelay, setSurgeTextDelay] = useState(false)
  const [surgeType, setSurgeType] = useState<SurgeType>(SurgeType.NoSurge)
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

  async function activateSurgeEffect() {
    const randomRoll = Math.random()
    let promptType = ''
    if (randomRoll < 0.35) {
      promptType = 'helpful'
    } else if (randomRoll < 0.6) {
      promptType = 'neutral'
    } else if (randomRoll < 0.8) {
      promptType = 'harmful'
    } else {
      promptType = 'chaotic'
    }

    try {
      const response = await fetch('/api/generate-surge?promptType=' + promptType)
      const data = await response.json()
      console.log('surge data')
      console.log(data)
      setSurgeEffect(data.message)
      if (randomRoll < 0.35) {
        setSurgeType(SurgeType.Helpful)
      } else if (randomRoll < 0.6) {
        setSurgeType(SurgeType.Neutral)
      } else if (randomRoll < 0.8) {
        setSurgeType(SurgeType.Harmful)
      } else {
        setSurgeType(SurgeType.Chaotic)
      }
    } catch (error) {
      setSurgeEffect('An error occurred: ' + error)
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
