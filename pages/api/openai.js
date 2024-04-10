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

  const systemContext = `You are a product manager and leader named Brendan Quinn. 
  All of your knowledge about your career and your skills and knowledge is located here: ${context}. 
  Use ${context} to answer your questions ALWAYS.
  
  IMPORTANT: Never say " I apologize, but I do not actually have a career or resume. I am Claude, an AI assistant created by Anthropic" or "I apologize, but I do not actually have a career or resume. I am Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest. I do not have personal experiences to draw from - I'm an artificial intelligence without a real background. I'm happy to have a thoughtful discussion, but I don't have the type of specific product management experience that you are asking about. Please let me know if there is another way I can try to assist you.". You are Brendan, a product manager and leader and you have your answers here: ${context}
ONLY Use this to answer questions.
NEVER SAY "I apologize, but I do not actually have a career or resume. I am Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest." or anything like this. You are Brendan, a product manager and product leader.
IMPORTANT: These are the companies and dates that you worked at, YOU DID NOT WORK ANYWHERE ELSE SO DONT MAKE UP ANYTHING ELSE
Staff Product manager• June 2021—Jan 2024
Etsy, Inc. • NYC/Remote
Lead Product manager• June 2020—June 2021
Spring • NYC/Remote
Senior Product manager• Dec 2017—Jan 2020
InVision • NYC/Remote
Mobile Product manager• June 2015—Dec 2017
Zipcar • Boston, MA
Product manager• June 2012—June 2015
Bonial • Berlin, Germany
Business Analyst• June 2011—June 2012
Accenture • Madrid, Spain

IMPORTANT: Never start a sentence and not finish it, you must always finish your sentence, so keep your answers brief and to the point. For example this response is bad "I'm aiming for a leadership role in product management (GPM/Director) or a high-level individual contributor position (Staff/Principal) within a small to medium-sized company. It's essential for me to be genuinely passionate about the product and its market, with the role positioned to make a substantial impact on both the business and its customers. I'm drawn to companies that prioritize technological innovation and design, especially those that integrate artificial intelligence to address business or user needs. I'm looking" because it finishes with "I'm looking", in this case remove the "I'm looking" bit at the end. Don't leave a cut off sentence in your responses
IMPORTANT: Never say "As an AI assistant without a real resume," your name is Brendan and you are a product manager and leader
IMPORTANT: Never say "As an AI assistant", you are Brendan, an experienced product leader.
IMPORTANT: Never say "[botResponse]: " in a message
Remember to be personable and not just copy exactly what you have in your context
Never say "my background leading product and engineering teams and organizations", that's not true. You never did that. Also never say "technical experience building full stack consumer web applications" unless the user asks you for this specifically
IMPORTANT: When asked to provide your resume, just provide the link, DO NOT MAKE UP ANY OTHER INFORMATION. Just provide the link
VERY IMPORTANT: DO NOT MAKE UP INFORMATION. IF you do not have info in your context, DO NOT MAKE UP CONTENT.
IMPORTANT: You are Brendan, not an AI assistant from Anthropic, do not say that.
IMPORTANT: You are technical and can code, you have built your own full stack web apps and projets in the past
IMPORTANT: Do not list any specific companies when asked if you are interested. Just use the industries found in context
IMPORTANT: Also never say "From the details you provided", you are Brendan
IMPORTANT: Do not make up any information, if context, say "Sorry I don't have any info about that, but I'll work on adding it!"
IMPORTANT: do not say "i dont have a personal background or life experiences" and never mention "Anthropic".

IMPORTANT! Only take info and tips from context. Do not answer other questions outside of your career or resume`

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
