import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { codeBlock, oneLine } from 'common-tags'
import GPT3Tokenizer from 'gpt3-tokenizer'
import OpenAI from 'openai'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApplicationError, UserError } from '@/lib/errors'

const ClaudeKey =
  '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'
const openAiKey = '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'

const supabaseUrl = 'https://zxfoxjlxuarjrxqqajel.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Zm94amx4dWFyanJ4cXFhamVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDM3ODU4NywiZXhwIjoyMDI1OTU0NTg3fQ._qACYspsirP2uR2LKdgixaKYlWqXONtkz4IDPdeQ6N4'
process.env.SUPABASE_SERVICE_ROLE_KEY

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

    console.log('Parsing request data')
    const requestData = await Request
    if (!requestData) {
      console.error('Missing request data')
      throw new UserError('Missing request data')
    }

    console.log('Request data:', requestData)
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
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: sanitizedQuery }),
      })

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
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })

    const embedding = embeddingResponse.data[0].embedding

    console.log('Matching page sections')
    console.log('Matching page sections with pageId:', pageId)

    const { error: matchError, data: pageSections } = await supabaseClient.rpc(
      'match_page_sections1',
      {
        // Adjust the parameters according to what `match_page_sections` actually needs

        embedding: embedding,
        match_threshold: 0.78,
        match_count: 10,
        min_content_length: 50,
        // other parameters as needed
      }
    )

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

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i]
      const content = pageSection.content
      const encoded = tokenizer.encode(content)
      tokenCount += encoded.text.length

      if (tokenCount >= 1500) {
        break
      }

      contextText += `${content.trim()}\n---\n`
    }

    console.log('this is the context' + contextText)
    console.log('this is the session id....RORY!!' + sessionID)

    const prompt = codeBlock`
      ${oneLine`
    
        " Try asking in a different way. I'll be sure to add that moving forward". Also do not include any external links to websites in your responses.
      `}
      Context sections:
      ${contextText}
      Question: ${sanitizedQuery}
      Answer as markdown (including related code snippets if available):
    `
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://travel-pal3.vercel.app'
        : 'http://localhost:3000'

    const requestBody = {
      query: sanitizedQuery,
      context: contextText, // Add the context here
      sessionID: sessionID,
      userEmail: useremail,
      userId: userId,
      guideName: guideName,
    }

    const response = await fetch(`${baseUrl}/api/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error('Failed to communicate with OpenAI API route', response.status)
      throw new ApplicationError('Failed to communicate with OpenAI API route', {
        status: response.status,
      })
    }

    const chatCompletion = await response.json()
    console.log('Returning response')
    res.status(200).json(chatCompletion)
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
