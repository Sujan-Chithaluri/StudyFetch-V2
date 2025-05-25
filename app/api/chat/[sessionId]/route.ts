// app/api/chat/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.sessionId;
    
    // Check if the chat session exists and belongs to the user
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
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete all messages in the chat session
    await prisma.message.deleteMany({
      where: {
        chatSessionId: sessionId,
      },
    });

    // Delete the chat session
    await prisma.chatSession.delete({
      where: {
        id: sessionId,
      },
    });

    // If this was the only chat session using this document, you might want to delete the document too
    if (chatSession.document) {
      const otherSessionsUsingDocument = await prisma.chatSession.count({
        where: {
          documentId: chatSession.document.id,
          id: {
            not: sessionId,
          },
        },
      });

      if (otherSessionsUsingDocument === 0) {
        // No other sessions are using this document, so we can delete it
        await prisma.document.delete({
          where: {
            id: chatSession.document.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    );
  }
}
