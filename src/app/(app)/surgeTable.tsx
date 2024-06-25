'use client'

import styles from './surgeTable.module.css'
import { useEffect, useState } from 'react'

interface SurgeTableProps {
  surgeEffects: string[]
}

export default function SurgeTable(props: SurgeTableProps) {
  const [surgeEffectOptions, setSurgeEffectOptions] = useState(props.surgeEffects)
  return <div className={styles.surgeEffect}></div>
}
