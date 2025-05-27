import { serve } from 'std/http/server.ts'
import { OpenAI } from 'openai/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface PolicyInput {
  id: string;
  policy_type_name: string;
  company_name: string;
  website: string;
  compliance_requirements: string[];
  frameworks: string[];
  regulations: string[];
  effective_date: string;
  organization_id: string;
  scraped_data?: {
    about?: string;
    contact?: string;
    privacy?: string;
    services?: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY') || '')
    const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-3.5-turbo'

    const { data } = await req.json()
    const policyInput: PolicyInput = data

    // Prepare the prompt for OpenAI
    const prompt = `Generate a comprehensive ${policyInput.policy_type_name} policy for ${policyInput.company_name} that includes:

1. Introduction and Purpose
2. Scope and Applicability
3. Data Collection and Usage
4. User Rights and Controls
5. Security Measures
6. Compliance and Legal Requirements
7. Updates and Changes
8. Contact Information

Company Details:
- Website: ${policyInput.website}
- Compliance Requirements: ${policyInput.compliance_requirements.join(', ')}
- Frameworks: ${policyInput.frameworks.join(', ')}
- Regulations: ${policyInput.regulations.join(', ')}
- Effective Date: ${policyInput.effective_date}

Company Information:
${policyInput.scraped_data?.about ? `About: ${policyInput.scraped_data.about}\n` : ''}
${policyInput.scraped_data?.contact ? `Contact: ${policyInput.scraped_data.contact}\n` : ''}
${policyInput.scraped_data?.privacy ? `Privacy: ${policyInput.scraped_data.privacy}\n` : ''}
${policyInput.scraped_data?.services ? `Services: ${policyInput.scraped_data.services}\n` : ''}

Please format the policy in HTML with proper headings, paragraphs, and lists.`

    const completion = await openai.createChatCompletion({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional policy writer with expertise in creating clear, comprehensive, and compliant policies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000
    })

    const generatedContent = completion.choices[0]?.message?.content || 'Failed to generate policy content'

    // Ensure the content is properly formatted HTML and add base styling
    const formattedContent = `
      <div style="color: black; font-family: Arial, sans-serif;">
        ${generatedContent}
      </div>
    `.trim()

    const response = {
      content: formattedContent,
      title: `${policyInput.policy_type_name} Policy - ${policyInput.company_name}`,
      lastUpdated: new Date().toISOString()
    }

    return new Response(JSON.stringify(response), {
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
