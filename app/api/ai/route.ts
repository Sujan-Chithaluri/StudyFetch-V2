// app/api/ai/route.ts
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    // Get prompt from request body
    const { prompt } = await req.json();
    
    // Use default prompt if none provided
    const userPrompt = prompt || 'Write a vegetarian lasagna recipe for 4 people.';
    
    const result = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt: userPrompt,
    });

    return new Response(JSON.stringify({ text: result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI response' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
