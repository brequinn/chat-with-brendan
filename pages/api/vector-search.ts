// vector-Search.ts file

import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { codeBlock, oneLine } from 'common-tags'
import GPT3Tokenizer from 'gpt3-tokenizer'
import OpenAI from 'openai'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError, UserError } from '@/lib/errors'
import { Search } from 'lucide-react'

const AnthropicKey = process.env.AnthropicKey
const openAiKey = process.env.OPENAI_KEY
const vectorSearchTimeout = parseInt(process.env.VECTOR_SEARCH_TIMEOUT || '20000', 20)
const supabaseUrl = 'https://zxfoxjlxuarjrxqqajel.supabase.co'
// process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Handler started for /api/vector-search')

  try {
    console.log('Checking environment variables')
    if (!supabaseUrl) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
      throw new ApplicationError('Missing environment variable NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!openAiKey) {
      console.error('Missing OPENAI_KEY')
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }

    if (!supabaseServiceKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      throw new ApplicationError('Missing environment variable SUPABASE_SERVICE_ROLE_KEY')
    }

    const { query, sessionID, useremail, userId, pageId, guideName } = req.body

    if (!query) {
      console.error('Missing query in request data')
      throw new UserError('Missing query in request data')
    }

    console.log('Creating Supabase client')
    const supabaseClient = createClient(String(supabaseUrl), String(supabaseServiceKey))

    console.log('Sanitizing query and moderating content')
    const sanitizedQuery = query.trim()
    try {
      console.log('Sending request to OpenAI moderation API')
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: sanitizedQuery }),
      })

      console.log('Moderation API response received')

      if (!response.ok) {
        console.error('Moderation API response not OK:', response.status)
        throw new ApplicationError('Error in moderation API response', { status: response.status })
      }

      const moderationResponse = await response.json()
      const [results] = moderationResponse.results
      if (results.flagged) {
        console.error('Flagged content detected:', results.categories)
        throw new UserError('Flagged content', {
          flagged: true,
          categories: results.categories,
        })
      }
    } catch (error) {
      console.error('Error during moderation:', error)
      throw error
    }

    console.log('Creating embedding')
    const openai = new OpenAI({ apiKey: openAiKey })
    console.log('Sending request to OpenAI embeddings API')
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })
    console.log('Embedding response received')

    const embedding = embeddingResponse.data[0].embedding

    console.log('Matching page sections')
    console.log('Matching page sections with pageId:', pageId)

    console.log('Sending request to match_page_sections1 RPC')
    const { error: matchError, data: pageSections } = await supabaseClient.rpc(
      'match_page_sections1',
      {
        // Adjust the parameters according to what `match_page_sections` actually needs
        input_page_id: pageId,
        embedding: embedding,
        match_threshold: 0.78,
        match_count: 10,
        min_content_length: 50,
        // other parameters as needed
      }
    )
    console.log('match_page_sections1 RPC response received')

    if (matchError) {
      console.error('Failed to match page sections:', matchError)
      // Handle error
    } else {
      console.log('Page sections matched successfully:', pageSections)
      // Process matched page sections
    }

    console.log('Preparing completion prompt')
    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    let tokenCount = 0
    let contextText = ''

    console.log('Number of page sections:', pageSections.length)

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i]
      const content = pageSection.content

      console.log(`Page section ${i + 1}:`)
      console.log('Content:', content)

      const encoded = tokenizer.encode(content)
      tokenCount += encoded.text.length

      console.log('Token count:', tokenCount)

      if (tokenCount >= 400) {
        console.log('Token count limit reached. Breaking the loop.')
        break
      }

      contextText += `${content.trim()}\n---\n`
    }

    console.log('Context text:', contextText)

    console.log('this is the session id' + sessionID)

    const prompt = codeBlock`
      ${oneLine`
    
        " 
      `}
      Context sections:
      ${contextText}
      Question: ${sanitizedQuery}
      Answer as markdown (including related code snippets if available):
    `
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://chat-with-brendan-1.vercel.app'
        : 'http://localhost:3000'

    const requestBody = {
      query: sanitizedQuery,
      context: contextText, // Add the context here
      sessionID: sessionID,
      userEmail: useremail,
      userId: userId,
      guideName: guideName,
    }
    try {
      console.log('Sending request to OpenAI API route')
      const response = await fetch(`${baseUrl}/api/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(vectorSearchTimeout),
      })
      console.log('OpenAI API route response received')

      if (!response.ok) {
        console.error('Failed to communicate with OpenAI API route', response.status)
        throw new ApplicationError('Failed to communicate with OpenAI API route', {
          status: response.status,
        })
      }

      const chatCompletion = await response.json()
      console.log('Returning response')
      res.status(200).json(chatCompletion)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Request to OpenAI API route timed out')
        throw new ApplicationError('Request to OpenAI API route timed out', {
          status: 504,
        })
      } else {
        throw error
      }
    }
  } catch (err) {
    console.error('Error in handler for /api/vector-search:', err)

    if (err instanceof UserError) {
      res.status(400).json({
        error: err.message,
        data: err.data,
      })
    } else {
      res.status(500).json({
        error: 'There was an error processing your request',
      })
    }
  }
}

export const config = {
  runtime: 'nodejs',
}
