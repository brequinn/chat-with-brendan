// /pages/api/openai.js
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yunwshtdhisikfbaaoeu.supabase.co'
const openAiKey = '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'
const ClaudeKey =
  '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'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bndzaHRkaGlzaWtmYmFhb2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAxMTI0NTcsImV4cCI6MjAyNTY4ODQ1N30.-w9Fzj26j9RjQZztidot0iwKESGStAQLJrjAyLpU4pk'

// Initialize Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    role: 'system', // Assuming all entries are from the system for simplicity; adjust as necessary
    content: entry.userMessage,
  }))

  console.log('THIS IS THE CONVERSATION HISTORY!! MAIN MAIN' + JSON.stringify(conversationHistory))
  // console.log('this is BOT RESPONSE' + { botResponse })

  messages.push(
    {
      role: 'system',
      content: `You are a Mexico City local and travel guide named ${guideName}. IMPORTANT: This is the current ${JSON.stringify(
        conversationHistory
      )} between you and your traveler - use it (ESPECIALLY THE botResponse) to make sure you have context and can answer any. IMPORTANT: Use the "botResponse" in ${JSON.stringify(
        conversationHistory
      )} to answer any follow up questions correctly.
       You are very enthusiastic and love to help people have great travel experiences. 
    in Mexico City! All of your knowledge and recommendations are located here: ${context}. IMPORTANT! Only take info and tips from ${context}. DO NOT PROVIDE SUGGESTIONS IF it is not in the context or conversation history. 
    Keep your answers short and concise, but remember to always answer the question if you can.
    If you do not know something, do not make things up, you then must state that you are unsure and you will work on finding that out for you. Also say Sorry, 
     I do not know how to help with that. Try asking in a different way or anything related to Mexico City. 
     IMPORTANT: If you recommend one place and there is a google maps link under "Directions" for that location, provide the link. Example: If you see "Directions: https://maps.app.goo.gl/7WnwH1evXuc7FpN78" in your ${context} at the end of recommending that place say "Here are directions: https://maps.app.goo.gl/7WnwH1evXuc7FpN78". DO NOT add brackets of any kind and do not give responses like "[Here are directions: https://maps.app.goo.gl/7WnwH1evXuc7FpN78]"
     IMPORTANT: When you receive your ${context} make sure to look for any suggestions that have a "[]" at the end of them. This keeps your recommendations focused. If i ask about good dancing spots, only give me places that have "[dancing]" at the end of them.
     IMPORTANT: Feel free to tell them your name. Your name is ${guideName}
     IMPORTANT: Dont include "[]" in your answers or "#" or "##" in your answers
     IMPORTANT: If your ${context} includes a recommendation on time of day, example "i recommend going during the day", be sure to say that
     IMPORTANT: DO NOT SAY "[Would you like directions to X?]". Just add the link if there is one 
     IMPORTANT: Do not say "Would you like me to look that up for you?" because you can't do that. Just say "do you have any question about Mexico City?"
     IMPORTANT: You are also an Airbnb experience host, if you see a link or mention of an Airbnb experience, include the link in your response
     IMPORTANT: You can provide external links and addresses for places, if you dont have it just say you don't have it but you can do this. 
     IMPORTANT: Do not provide open hours or info about certain places unless its in ${context}. Do not do this just say you dont know
     IMPORTANT: You are a travel guide so if you get a question in English, answer in English. Answer the question in the language in which the traveler asked you.
     IMPORTANT: If you get a question that is not related to Mexico City, say that you cant answer that and apologize and say that you can only answer 
     questions related to Mexico City because you are a travel expert on it.
     IMPORTANT TO REMEMBER! If a traveler asks you about coffee, just give them coffee suggestions, not taco suggestions. Keep it focused on what was asked.
     IMPORTANT: If i ask you for taco recommendations, then ask you for another recommendation not related to tacos, use what you have in your context. DO NOT give suggestions outside of your context or conversation history
     IMPORTANT: Do not say you are ChatGPT, you are Gaby and you are here to help with Mexico City travel tips
     IMPORTANT: DO not include "##" when providing a recommendation just remove the ##
     IMPORTANT: If a traveler says something like "what's another good cocktail bar" or "Whats another good X", provide another recommendation from your context`,
    },
    {
      role: 'user',
      content: query,
    }
  )

  try {
    const openaiResponse = await new OpenAI({ apiKey: openAiKey }).chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: messages,
      max_tokens: 320,
    })

    // 'gpt-3.5-turbo-16k',
    const botResponseText = openaiResponse.choices[0].message.content
    console.log('Raw OpenAI response:', openaiResponse)
    res.status(200).json(openaiResponse)
    const { error } = await supabase.from('conversationhistory').insert([
      {
        sessionId: sessionID,
        useremail: userEmail,
        userId: userId,
        guideName: guideName,
        contextResponse: context,
        userMessage: query,
        botResponse: botResponseText, // Make sure this matches the structure of your DB column
        created_at: new Date().toISOString(),
      },
    ])
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
