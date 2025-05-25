// app/api/chat/[sessionId]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    const sessionId = params.sessionId;

    // Verify the chat session exists and belongs to the user
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        document: true,
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
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

    // Generate AI response
    // In a real app, you would call your AI service here
    const aiResponse = `This is a placeholder AI response. In a real application, this would be generated based on the document content and user query: "${content}"`;

    // Create AI message
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        isUserMessage: false,
        userId: session.user.id, // AI messages are still associated with the user
        chatSessionId: sessionId,
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
