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
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  // Get current chat session
  const chatSession = await prisma.chatSession.findUnique({
    where: {
      id: params.sessionId,
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
    notFound();
  }
  
  // Get the total count of sessions
  const totalSessions = await prisma.chatSession.count({
    where: {
      userId: session.user.id,
      type: "TUTOR",
    }
  });
  
  // Get sessions centered around the current session
  // First, get the current session's position in the ordered list
  const sessionsBeforeCurrent = await prisma.chatSession.count({
    where: {
      userId: session.user.id,
      type: "TUTOR",
      updatedAt: {
        gt: chatSession.updatedAt // Sessions updated after current (they come before in desc order)
      }
    }
  });
  
  const currentPosition = sessionsBeforeCurrent; // 0-based index
  const sessionsPerPage = 5;
  
  // Calculate how many sessions to fetch before and after
  const fetchBefore = Math.min(currentPosition, sessionsPerPage);
  const fetchAfter = Math.min(totalSessions - currentPosition - 1, sessionsPerPage);
  
  // Fetch the sessions around the current one
  const surroundingSessions = await prisma.chatSession.findMany({
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
    skip: Math.max(0, currentPosition - fetchBefore),
    take: fetchBefore + 1 + fetchAfter, // Before + current + after
  });
  
  // Check if there are more sessions before or after
  const hasMoreBefore = currentPosition > fetchBefore;
  const hasMoreAfter = totalSessions - currentPosition - 1 > fetchAfter;
  
  return (
    <TutorSessionLayout 
      currentSession={chatSession}
      surroundingSessions={surroundingSessions}
      hasMoreBefore={hasMoreBefore}
      hasMoreAfter={hasMoreAfter}
      totalSessions={totalSessions}
      currentPosition={currentPosition}
    />
  );
}
