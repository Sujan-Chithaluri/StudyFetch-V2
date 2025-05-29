// app/api/chat/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { deletePdfFromBlob } from '@/lib/blob';

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

    // If there's a document associated with this chat session
    if (chatSession.document) {
      // Delete the document from the database
      await prisma.document.delete({
        where: {
          id: chatSession.document.id,
        },
      });
      
      // Delete the file from blob storage if URL exists
      if (chatSession.document.fileUrl) {
        try {
          await deletePdfFromBlob(chatSession.document.fileUrl);
        } catch (blobError) {
          console.error("Error deleting file from blob storage:", blobError);
          // Continue with the response even if blob deletion fails
        }
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
