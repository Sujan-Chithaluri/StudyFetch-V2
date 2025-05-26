// app/api/generate-recipe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: prompt || 'Write a vegetarian lasagna recipe for 4 people.',
    });
    
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
