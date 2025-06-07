// app/(chat)/flashcards/[sessionId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import FlashcardSessionLayout from "@/components/flashcards/FlashcardsSessionLayout";

export default async function FlashcardsSessionPage({
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
    if (!params || !params.sessionId) {
      console.error("Session ID is missing from params");
      notFound();
    }

    const sessionId = params.sessionId;

    // Get current chat session
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
        type: "FLASHCARDS",
      },
      include: {
        document: true,
        messages: {
          where: {
            isUserMessage: false,
            content: {
              contains: '"type":"flashcards"',
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!chatSession) {
      console.error(`Flashcards session not found: ${sessionId}`);
      notFound();
    }

    // Get recent flashcard sessions for the sidebar
    const recentSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        type: "FLASHCARDS",
      },
      include: {
        document: {
          select: {
            title: true,
            fileName: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    // Format flashcard sets from messages
    const flashcardSets = chatSession.messages
      .map((message) => {
        try {
          const content = JSON.parse(message.content);
          if (content.type === "flashcards") {
            return {
              id: message.id,
              title: content.title || "Flashcard Set",
              createdAt: message.createdAt.toISOString(),
              flashcards: content.flashcards || [],
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return (
      <FlashcardSessionLayout
        currentSession={chatSession}
        surroundingSessions={recentSessions}
        hasMoreBefore={false}
        hasMoreAfter={recentSessions.length >= 10}
        totalSessions={recentSessions.length}
        currentPosition={recentSessions.findIndex((s) => s.id === sessionId)}
        flashcardSets={flashcardSets}
      />
    );
  } catch (error) {
    console.error("Error in FlashcardsSessionPage:", error);
    notFound();
  }
}
