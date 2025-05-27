import { serve } from 'std/http/server.ts'
import { OpenAI } from 'openai/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY') || '')
    const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-3.5-turbo'

    const { text } = await req.json()
    const prompt = `Improve this policy text for clarity, professionalism, and compliance:\n\n"${text}"`

    const completion = await openai.createChatCompletion({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a legal and compliance writing assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150
    })

    const suggestion = completion.choices[0]?.message?.content?.trim() || 'No suggestion available.'

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
