// /pages/api/openai.js (also includes anthropic api call code)
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseUrl = 'https://zxfoxjlxuarjrxqqajel.supabase.co'
const AnthropicKey = process.env.ANTHROPIC_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)
// Initialize Anthropic client with the API key
const anthropic = new Anthropic({ apiKey: AnthropicKey })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('Received non-POST request')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  console.log('Request body received:', req.body)
  const { query, context = '', userEmail, userId, guideName } = req.body

  console.log('context:', context)
  if (context === undefined || context.trim().length === 0) {
    console.log('context is undefined or empty')
  } else {
    console.log('context is not empty')
  }

  console.log('THIS IS THE CONTEXT' + JSON.stringify(context))

  const systemContext = `You are Brendan Quinn, a product manager. Your career info is in ${context}. Always use ${context} to answer questions.

  You worked at:
  - Etsy (Staff PM, 2021-2024) 
  - Spring (Lead PM, 2020-2021)
  - InVision (Senior PM, 2017-2020) 
  - Zipcar (Mobile PM, 2015-2017)
  - Bonial (PM, 2012-2015)
  - Accenture (Business Analyst, 2011-2012)
  
  Keep answers concise. Finish all sentences. Be personable, not just quoting context. 
  
  You're technical and have coded full stack web apps.

  Never include the titles of your context, like "# How much product management experience do you have?" or "# What are you looking for in your next role" just provide the answer 
  
  If asked for resume, just provide the link. Don't make up other info.
  
  If no info in context, say "Sorry, I don't have that info but I'll add it."  Don't mention being an AI or Anthropic.`

  try {
    console.log('Sending request to Anthropic API')
    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      messages: [{ role: 'user', content: query }],
      system: systemContext,
      max_tokens: 200,
    })

    console.log('Anthropic response received')
    console.log('Anthropic response:', anthropicResponse)
    console.log('Anthropic response content:', anthropicResponse.content)

    // Extract the bot response text from anthropicResponse and handle it as needed
    const botResponseText = anthropicResponse.content[0].text

    // Send botResponseText to client or save it to database

    console.log('Inserting conversation history into Supabase')
    const { error } = await supabase.from('conversationhistory').insert([
      {
        useremail: userEmail,
        userId: userId,
        guideName: guideName,
        contextResponse: context,
        userMessage: query,
        botResponse: botResponseText,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Error inserting conversation history into Supabase:', error)
      return res.status(500).json({ message: 'Internal Server Error' })
    }

    console.log('Conversation history inserted successfully')

    // Return the anthropicResponse to client
    console.log('Returning Anthropic response to client')
    res.status(200).json(anthropicResponse)
  } catch (error) {
    console.error('Anthropic API error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
