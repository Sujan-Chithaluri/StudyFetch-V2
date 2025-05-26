// app/api/test-ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/chat";
import { Message } from "ai";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    // Create a simple message
    const messages: Message[] = [
      {
        id: "test-1",
        role: "user",
        content: content || "Hello, can you help me with something?",
      }
    ];
    
    // Generate AI response
    let aiResponseText = '';
    try {
      aiResponseText = await generateChatResponse(messages);
      console.log("AI response generated:", aiResponseText.substring(0, 100) + "...");
    } catch (error) {
      console.error("Error generating AI response:", error);
      aiResponseText = "I'm sorry, I encountered an error while processing your request.";
    }

    // const mockResponse = "This is a mock response to test the API route. Your message was: " + content;

    return NextResponse.json({
      userMessage: {
        id: "test-user",
        content: content,
        isUserMessage: true,
        createdAt: new Date(),
      },
      aiMessage: {
        id: "test-ai",
        content: aiResponseText,
        isUserMessage: false,
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error("Error in test AI route:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
