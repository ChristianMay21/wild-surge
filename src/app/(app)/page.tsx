import Image from 'next/image'
import styles from './page.module.css'
import { useState } from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import Main from './main'

export default async function Home() {
  const payload = await getPayloadHMR({ config: configPromise })
  const surgeEffectsRaw = await payload.find({
    collection: 'surge',
    limit: 1,
  })
  const surgeEffects = (surgeEffectsRaw.docs[0] ? surgeEffectsRaw.docs[0].table ?? '' : '').split(
    '\n',
  )
  return (
    <main className={styles.main}>
      <Main surgeTable={surgeEffects}></Main>
    </main>
  )
}
