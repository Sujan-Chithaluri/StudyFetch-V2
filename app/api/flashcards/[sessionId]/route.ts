// app/api/flashcards/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.sessionId;

    // Get all messages with flashcard content for this session
    const messages = await prisma.message.findMany({
      where: {
        chatSessionId: sessionId,
        userId: session.user.id,
        isUserMessage: false,
        content: {
          contains: '"type":"flashcards"'
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the flashcard sets
    const flashcardSets = messages.map(message => {
      try {
        const content = JSON.parse(message.content);
        if (content.type === 'flashcards') {
          return {
            id: message.id,
            title: content.title || 'Flashcard Set',
            createdAt: message.createdAt.toISOString(),
            flashcards: content.flashcards || []
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ flashcardSets });
  } catch (error) {
    console.error("Error fetching flashcard sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcard sets" },
      { status: 500 }
    );
  }
}
