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

interface PrevSurge {
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
  const [prevSurges, setPrevSurges] = useState<PrevSurge[]>([])
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
    console.log(response)
    window.test0 = response
    let data = await response.json()
    let message = await data.message
    console.log('message: ', data)
    window.test1 = data
    console.log('message: ', message)
    window.test = message
    if (data.message.trim().startsWith('SyntaxError')) {
      console.log('Retrying.')
      return await getSurgeResult(promptType)
    } else {
      return message
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
      }, 750)

      setPrevSurges((prevSurges) => [...prevSurges, { text: message, surgeType: surgeType }])
      setCurrentSurgeIndex(prevSurges.length)
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
