// app/api/claude/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function GET(request: NextRequest) {
  console.log('GET fired')
  const promptType = request.nextUrl.searchParams.get('promptType')
  let prompt = ''

  const payload = await getPayloadHMR({ config: configPromise })
  const surgeEffectsRaw = await payload.find({
    collection: 'surge',
    limit: 1,
  })
  const surgeEffects = surgeEffectsRaw.docs[0] ? surgeEffectsRaw.docs[0].table ?? '' : ''

  const helpfulSurgeData = (
    await payload.find({
      collection: 'prompt',
      limit: 1,
      where: {
        title: {
          equals: 'helpful',
        },
      },
    })
  ).docs
  const helpfulSurgePrompt =
    helpfulSurgeData.length > 0
      ? helpfulSurgeData[0].prompt
      : "Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that has a beneficial effect for the sorcerer - including abilities that damage/apply status conditions to enemies only, or improve the sorceror's or their allies' abilities. "

  const neutralSurgeData = (
    await payload.find({
      collection: 'prompt',
      limit: 1,
      where: {
        title: {
          equals: 'neutral',
        },
      },
    })
  ).docs
  const neutralSurgePrompt =
    neutralSurgeData.length > 0
      ? helpfulSurgeData[0].prompt
      : 'Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that will create a risk to both the sorcerer/their party and their enemies. '

  const harmfulSurgeData = (
    await payload.find({
      collection: 'prompt',
      limit: 1,
      where: {
        title: {
          equals: 'harmful',
        },
      },
    })
  ).docs
  const harmfulSurgePrompt =
    harmfulSurgeData.length > 0
      ? helpfulSurgeData[0].prompt
      : 'Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that will be bad for the sorcerer and their party. '

  const chaoticSurgeData = (
    await payload.find({
      collection: 'prompt',
      limit: 1,
      where: {
        title: {
          equals: 'chaotic',
        },
      },
    })
  ).docs
  const chaoticSurgePrompt =
    chaoticSurgeData.length > 0
      ? helpfulSurgeData[0].prompt
      : 'Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that will be be a chaotic or silly and harmless magical effect. '

  const anthropic = new Anthropic({
    apiKey: 'my_api_key',
  })

  switch (promptType) {
    case 'helpful':
      prompt += helpfulSurgePrompt
      break
    case 'neutral':
      prompt += neutralSurgePrompt
      break
    case 'harmful':
      prompt += harmfulSurgePrompt
      break
    default:
      prompt += chaoticSurgePrompt
  }

  prompt += 'Please use the following as inspiration for wild magic surge effects: ' + surgeEffects

  const msg = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 10240,
    messages: [{ role: 'user', content: prompt }],
  })

  return NextResponse.json({ msg })
}
