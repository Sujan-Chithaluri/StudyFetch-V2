// app/api/chat/[sessionId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { generateChatResponse } from "@/lib/ai/anthropic/tutor-chat"; // Adjust the import based on your AI library
import { Message } from "ai";

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.sessionId;
    const { content, documentContent } = await request.json();

    // Verify the chat session exists and belongs to the user
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        isUserMessage: true,
        userId: session.user.id,
        chatSessionId: sessionId,
      },
    });

    // Convert database messages to AI SDK messages
    const aiMessages: Message[] = chatSession.messages.map((msg) => ({
      id: msg.id,
      role: msg.isUserMessage ? "user" : "assistant",
      content: msg.content,
    }));

    // Add the new user message
    aiMessages.push({
      id: userMessage.id,
      role: "user",
      content,
    });

    // Generate AI response
    let aiResponseText = "";
    try {
      aiResponseText = await generateChatResponse(aiMessages, documentContent);
    } catch (error) {
      console.error("Error generating AI response:", error);
      aiResponseText =
        "I'm sorry, I encountered an error while processing your request.";
    }

    // Create AI message in database
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponseText,
        isUserMessage: false,
        userId: session.user.id,
        chatSessionId: sessionId,
      },
    });

    await prisma.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
