// app/api/flashcards/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { flashcardSchema, flashcardSetSchema } from "@/lib/ai/anthropic/flashcards";
import { anthropic } from '@ai-sdk/anthropic';
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    // Get the chat session with document
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        document: true,
      },
    });

    if (!chatSession || !chatSession.document) {
      return NextResponse.json({ error: "Session or document not found" }, { status: 404 });
    }

    // Format document content
    let documentContent = "";
    if (chatSession.document.content) {
      const content = chatSession.document.content as any;
      if (Array.isArray(content.pages)) {
        documentContent = content.pages
          .map((page: any) => `[Page ${page.pageNumber}]\n${page.text}`)
          .join("\n\n")
          .slice(0, 15000); // Limit to avoid token limits
      }
    }

    // Stream the flashcard generation
    const result = streamObject({
      model: anthropic("claude-3-haiku-20240307"),
      messages: [
        {
          role: "system",
          content: 
            "You are an AI flashcard generator. Your job is to take a document and create 5 to 10 multiple-choice flashcards based on the content of the document. Each flashcard should have 4 options with one correct answer."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create 5 to 10 multiple-choice flashcards based on this document:\n\n${documentContent}`
            }
          ]
        }
      ],
      schema: flashcardSetSchema,
      // output: "array",
      onFinish: async ({ object }) => {
        try {
          const res = flashcardSetSchema.safeParse(object);
          if (res.error) {
            console.error("Validation error:", res.error.errors.map(e => e.message).join("\n"));
            return;
          }
          
          // Create a new message with flashcards in content
          await prisma.message.create({
            data: {
              content: JSON.stringify({
                type: "flashcards",
                title: `${res?.data?.title || "Document"}`,
                flashcards: res?.data?.flashcards,
                createdAt: new Date().toISOString()
              }),
              isUserMessage: false,
              userId: session.user.id,
              chatSessionId: sessionId,
            },
          });

          // Update the chat session's updatedAt timestamp
          await prisma.chatSession.update({
            where: {
              id: sessionId,
            },
            data: {
              updatedAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Error saving flashcards:", error);
        }
      }
    });

    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
