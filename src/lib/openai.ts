import OpenAI from 'openai';

// Get API key from environment variables (make sure it's prefixed with NEXT_PUBLIC_)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing VITE_OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Only for client-side usage in this demo
});

export async function generatePolicy(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional policy writer. Generate a comprehensive policy document based on the user\'s requirements. Format the response in markdown with appropriate headings, sections, and bullet points.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Failed to generate policy';
  } catch (error) {
    console.error('Error generating policy:', error);
    return 'Failed to generate policy due to an error.';
  }
}
