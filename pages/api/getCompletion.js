// pages/api/getCompletion.js
import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const query = req.body.query

    // Create an instance of the OpenAI client directly with the API key
    const openai = new OpenAI({
      apiKey: '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',
    })

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: query }],
        model: 'ft:gpt-3.5-turbo-1106:personal::8kLW2rHa',
      })
      console.log(completion.choices[0])
      res.status(200).json({ message: completion.choices[0].message.content })
    } catch (error) {
      console.error('Error in generating completion:', error)
      res.status(500).json({ error: 'Error in generating completion' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
