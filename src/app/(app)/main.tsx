'use client'

import Image from 'next/image'
import styles from './main.module.css'
import { useEffect, useRef, useState } from 'react'
import SurgeTable from './surgeTable'

interface MainProps {
  surgeTable: string[]
}

export default function Main(props: MainProps) {
  const [surgeProbability, setSurgeProbability] = useState(0.05)
  const [tidesDisabled, setTidesDisabled] = useState(false)
  const [surgeEffect, setSurgeEffect] = useState('Chaos comes.')
  const [surgeTextDelay, setSurgeTextDelay] = useState(false)
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

  function handleSurgeClick() {
    const surgeOccurs = Math.random() < surgeProbability
    setSurgeTextDelay(true)
    setTimeout(() => {
      setSurgeTextDelay(false)
      if (surgeOccurs) {
        playSurgeSound()
        activateSurgeEffect()
        setSurgeProbability(0.05)
        setTidesDisabled(false)
      } else {
        playNoSurgeSound()
        setSurgeEffect('The wild magic waits.')
        setSurgeProbability((surgeProbability) => surgeProbability + 0.05)
      }
    }, 750)
  }

  function handleTidesClick() {
    setSurgeProbability(1)
  }

  function activateSurgeEffect() {
    const possibleOutcomes = props.surgeTable.length
    const outcome = props.surgeTable[Math.floor(Math.random() * possibleOutcomes)]
    setSurgeEffect(outcome)
  }

  return (
    <div className={styles.main}>
      <div className={styles.surgeTableHeadingContainer}>
        <h2 className={styles.heading}>Surge Table</h2>
      </div>
      <div className={styles.surgeEffectContainer}>
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
