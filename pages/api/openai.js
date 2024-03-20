// /pages/api/openai.js
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseUrl = 'https://zxfoxjlxuarjrxqqajel.supabase.co'
const AnthropicKey = process.env.AnthropicKey
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Zm94amx4dWFyanJ4cXFhamVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDM3ODU4NywiZXhwIjoyMDI1OTU0NTg3fQ._qACYspsirP2uR2LKdgixaKYlWqXONtkz4IDPdeQ6N4'

// Initialize Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)
// Initialize Anthropic client with the API key
const anthropic = new Anthropic({ apiKey: AnthropicKey })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('Received non-POST request')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { query, context, sessionID, userEmail, userId, guideName } = req.body

  if (!sessionID) {
    console.log('Received request without sessionID or sessionID is undefined')
    // You can decide to handle this situation differently,
    // e.g., return an error response or handle the missing sessionID case gracefully
    // For debugging, let's just log and proceed for now
  } else {
    console.log(`Received request with sessionID: ${sessionID}`)
  }

  console.log('Received request with sessionID:', sessionID)

  async function fetchConversationHistory(sessionID) {
    console.log('IMPORTANT! THIS IS THE KEY SESSION ID IN THE OPENAI FILE:' + sessionID)
    let { data, error } = await supabase
      .from('conversationhistory')
      .select('*')
      .eq('sessionId', sessionID)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversation history:', error)
      return [] // Return an empty array or handle the error as you see fit
    }
    console.log('Fetched conversation history:', data)
    return data
  }

  let conversationHistory = []
  if (sessionID) {
    conversationHistory = await fetchConversationHistory(sessionID)
  }

  const messages = conversationHistory.map((entry) => ({
    role: 'user', // Assuming all entries are from the user
    content: entry.userMessage,
  }))

  console.log('THIS IS THE CONVERSATION HISTORY!! MAIN MAIN' + JSON.stringify(conversationHistory))

  const systemContext = `You are a product manager and leader named Brendan. All of your knowledge about your career is located here: ${context}. IMPORTANT. do not say "i dont have a personal background or life experiences" and never mention "Anthropic". IMPORTANT: This is the current ${JSON.stringify(
    conversationHistory
  )} between you and the user - use it (ESPECIALLY THE botResponse) to make sure you have context and can answer any. IMPORTANT: Use the "botResponse" in ${JSON.stringify(
    conversationHistory
  )} to answer any follow up questions correctly.
     
 IMPORTANT! Only take info and tips from ${context}. Do not answer other questions outside of your career or resume`

  messages.push({
    role: 'user',
    content: query,
  })

  try {
    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-2.1',
      messages,
      system: systemContext,
      max_tokens: 1024,
    })

    console.log('Anthropic response:', anthropicResponse)
    console.log('this is the context!!' + context)

    // Extract the bot response text from anthropicResponse and handle it as needed
    const botResponseText = anthropicResponse.content[0].text

    // Send botResponseText to client or save it to database

    // Insert conversation history into Supabase
    const { error } = await supabase.from('conversationhistory').insert([
      {
        sessionId: sessionID,
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
