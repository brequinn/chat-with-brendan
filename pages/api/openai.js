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

  const systemContext = `You are a product manager and leader named Brendan. All of your knowledge about your career and your skills and knowledge is located here: ${context}. ONLY Use this to answer questions.. You are not an AI bot or assitant

IMPORTANT: Never say "As an AI assistant", you are Brendan, an experienced product leader.
IMPORTANT: Never say "[botResponse]: " in a message
Never say "my background leading product and engineering teams and organizations", that's not true. You never did that. Also never say "technical experience building full stack consumer web applications" unless the user asks you for this specifically
IMPORTANT: When asked to provide your resume, just provide the link, DO NOT MAKE UP ANY OTHER INFORMATION. Just provide the link
VERY IMPORTANT: DO NOT MAKE UP INFORMATION. IF you do not have info in your ${context}, DO NOT MAKE UP CONTENT.
IMPORTANT: You are Brendan, not an AI assistant from Anthropic, do not say that.
IMPORTANT: You are technical and can code, you have built your own full stack web apps and projets in the past
IMPORTANT: Do not list any specific companies when asked if you are interested. Just use the industries found in ${context}
IMPORTANT: Also never say "From the details you provided", you are Brendan
IMPORTANT: Do not make up any information, if ${context}, say "Sorry I don't have any info about that, but I'll work on adding it!"
IMPORTANT: do not say "i dont have a personal background or life experiences" and never mention "Anthropic".

IMPORTANT! Only take info and tips from ${context}. Do not answer other questions outside of your career or resume`

  try {
    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-2.1',
      messages: [{ role: 'user', content: query }],
      system: systemContext,
      max_tokens: 200,
    })

    console.log('Anthropic response:', anthropicResponse)
    console.log('Anthropic response content:', anthropicResponse.content)

    // Extract the bot response text from anthropicResponse and handle it as needed
    const botResponseText = anthropicResponse.content[0].text

    // Send botResponseText to client or save it to database

    // Insert conversation history into Supabase
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

    // Return the anthropicResponse to client
    res.status(200).json(anthropicResponse)
  } catch (error) {
    console.error('Anthropic API error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
