// app/api/claude/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

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

  async function getPromptWithName(name: string) {
    return (
      await payload.find({
        collection: 'prompt',
        limit: 1,
        where: {
          title: {
            equals: name,
          },
        },
      })
    ).docs
  }

  const helpfulSurgeData = await getPromptWithName('helpful')
  const helpfulSurgePrompt =
    helpfulSurgeData.length > 0
      ? helpfulSurgeData[0].prompt
      : "Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that has a beneficial effect for the sorcerer - including abilities that damage/apply status conditions to enemies only, or improve the sorceror's or their allies' abilities. "

  const neutralSurgeData = await getPromptWithName('neutral')
  const neutralSurgePrompt =
    neutralSurgeData.length > 0
      ? neutralSurgeData[0].prompt ?? ''
      : 'Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that will create a risk to both the sorcerer/their party and their enemies. '

  const harmfulSurgeData = await getPromptWithName('harmful')
  const harmfulSurgePrompt =
    harmfulSurgeData.length > 0
      ? harmfulSurgeData[0].prompt ?? ''
      : 'Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that will be bad for the sorcerer and their party. '

  const chaoticSurgeData = await getPromptWithName('chaotic')
  const chaoticSurgePrompt =
    chaoticSurgeData.length > 0
      ? chaoticSurgeData[0].prompt ?? ''
      : 'Please come up with a Dungeons and Dragons 5th edition wild magic surge effect that will be be a chaotic or silly and harmless magical effect. '

  const systemPromptData = await getPromptWithName('system')
  const systemPrompt =
    systemPromptData.length > 0
      ? systemPromptData[0].prompt ?? ''
      : 'Your job is to create a single original Dungeons and Dragons 5th edition wild magic surge effect as a response to any prompt, and return only a single surge effect. Please stay concise, but also keep things chaotic and silly. Each prompt will describe different characteristics it wants for its surge effect - please pay careful attention to the characteristics the prompt requests and use them to inform your response. Try to put silly flavor on it, and make sure to give every surge effect a cool name.'

  const anthropic = new Anthropic()

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

  console.log('MESSAGE')
  console.log(prompt)
  const msg = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })
  let message = ''
  switch (msg.content[0].type) {
    case 'text':
      message = msg.content[0].text
      break
    default:
      message = 'Error: wrong type of content returned by Anthropic API'
  }

  return NextResponse.json({ message })
}
