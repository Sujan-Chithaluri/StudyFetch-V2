// app/(chat)/tutor/[sessionId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import TutorSessionLayout from "@/components/tutor/TutorSessionLayout";

export default async function TutorSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      redirect("/login");
    }
    
    // Ensure sessionId is a string
    const sessionId = params?.sessionId;
    
    if (!sessionId) {
      console.error("Session ID is missing from params");
      notFound();
    }
    
    // Get current chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        document: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    
    if (!chatSession) {
      console.error(`Chat session not found: ${sessionId}`);
      notFound();
    }
    
    // Get recent chat sessions for the sidebar
    const recentSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        type: "TUTOR",
      },
      include: {
        document: {
          select: {
            title: true,
            fileName: true,
          },
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10, // Initial page size
    });
    
    // Extract PDF content from document if available
    let pdfContent = [];
    if (chatSession.document?.content) {
      // Check if content has pages array (from our parser)
      if (Array.isArray(chatSession.document.content?.pages)) {
        pdfContent = chatSession.document.content?.pages.map(page => page.text);
      } 
      // Check if content has content array (direct text array)
      else if (Array.isArray(chatSession.document.content?.content)) {
        pdfContent = chatSession.document.content?.content;
      }
    }
    
    return (
      <TutorSessionLayout 
        currentSession={chatSession}
        surroundingSessions={recentSessions}
        hasMoreBefore={false}
        hasMoreAfter={recentSessions.length >= 10}
        totalSessions={recentSessions.length}
        currentPosition={recentSessions.findIndex(s => s.id === sessionId)}
        pdfContent={pdfContent}
      />
    );
  } catch (error) {
    console.error("Error in TutorSessionPage:", error);
    notFound();
  }
}
