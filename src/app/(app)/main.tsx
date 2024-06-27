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
  const [nextSurgeEffect, setNextSurgeEffect] = useState<Surge | null>(null)
  const [nextSurgeEffectLoading, setNextSurgeEffectLoading] = useState(true)
  const surgeSound = useRef<HTMLAudioElement | null>(null)
  const noSurgeSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create an Audio object when the component mounts
    surgeSound.current = new Audio('/surge-sound.wav')
    noSurgeSound.current = new Audio('/no-surge-sound.wav')

    const fetchData = async () => {
      try {
        console.log('fetching data')
        const newSurge = await generateRandomSurge()
        setNextSurgeEffect(newSurge)
        setNextSurgeEffectLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
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
    if (!nextSurgeEffectLoading) {
      const surgeOccurs = Math.random() < surgeProbability
      setSurgeTextDelay(true)
      setTimeout(async () => {
        setSurgeTextDelay(false)
        if (surgeOccurs) {
          playSurgeSound()
          if (nextSurgeEffect != null) {
            setSurgeType(nextSurgeEffect.surgeType)
            setSurgeEffect('Wild magic surges...')
            setSurgeProbability(0.05)
            setTidesDisabled(false)
            setNextSurgeEffectLoading(true)
            setTimeout(() => {
              setPrevSurges((prevSurges) => [...prevSurges, nextSurgeEffect])
              setCurrentSurgeIndex((prevSurgeIndex) => prevSurgeIndex + 1)
              setSurgeEffect(nextSurgeEffect.text)
            }, 3000)
            const newSurge = await generateRandomSurge()
            await setNextSurgeEffect(newSurge)
            setNextSurgeEffectLoading(false)
          } else {
            console.error('Bug! nextSurgeEffect is null.')
          }
        } else {
          playNoSurgeSound()
          setSurgeEffect('The wild magic waits.')
          setSurgeType(SurgeType.NoSurge)
          setSurgeProbability((surgeProbability) => surgeProbability + 0.05)
        }
      }, 2000)
    }
  }

  function handleTidesClick() {
    setSurgeProbability(1)
  }

  function getStringForSurgeType(surgeType: SurgeType): string {
    switch (surgeType) {
      case SurgeType.Helpful:
        return 'helpful'
      case SurgeType.Neutral:
        return 'neutral'
      case SurgeType.Harmful:
        return 'harmful'
      case SurgeType.Chaotic:
        return 'chaotic'
      default:
        return 'no-surge'
    }
  }

  function rollRandomSurgeType(): SurgeType {
    const randomRoll = Math.random()
    if (randomRoll < 0.35) {
      return SurgeType.Helpful
    } else if (randomRoll < 0.6) {
      return SurgeType.Neutral
    } else if (randomRoll < 0.8) {
      return SurgeType.Harmful
    } else {
      return SurgeType.Chaotic
    }
  }

  async function getSurgeResult(surgeType: SurgeType): Promise<Surge> {
    const response = await fetch('/generate-surge?promptType=' + getStringForSurgeType(surgeType))
    if (response.status < 300) {
      let data = await response.json()
      let message = await data.message
      return {
        text: message as string,
        surgeType: surgeType,
      }
    } else {
      console.log('retrying')
      /*Retry after 10 seconds */
      return new Promise<Surge>((resolve, reject) => {
        setTimeout(async () => {
          let retry = await getSurgeResult(surgeType)
          resolve(retry)
        }, 10000)
      })
    }
  }

  async function generateRandomSurge(): Promise<Surge> {
    return await getSurgeResult(rollRandomSurgeType())
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
          <button
            className={styles.surgeLabel}
            onClick={handleSurgeClick}
            disabled={nextSurgeEffectLoading}
          >
            Surge
          </button>
        </div>
      </div>
    </div>
  )
}
