import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(req: Request) {
  // Get prompt from request body
  const { prompt } = await req.json();
  
  // Use default prompt if none provided
  const userPrompt = prompt || 'Write a vegetarian lasagna recipe for 4 people.';
  
  const res = await generateText({
    model: anthropic('claude-3-haiku-20240307'),
    prompt: userPrompt,
  });

  return new Response(JSON.stringify(res), {
    headers: { 'Content-Type': 'application/json' },
  });
}
