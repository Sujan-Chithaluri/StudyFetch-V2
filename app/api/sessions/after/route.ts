// app/api/sessions/after/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type")?.toUpperCase() || "TUTOR";
    const sessionId = url.searchParams.get("sessionId");
    const limit = parseInt(url.searchParams.get("limit") || "5");
    
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }
    
    // Get the reference session
    const referenceSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!referenceSession) {
      return NextResponse.json({ error: "Reference session not found" }, { status: 404 });
    }
    
    // Get sessions after the reference session
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        type: type as any,
        updatedAt: {
          lt: referenceSession.updatedAt // Sessions updated before reference (they come after in desc order)
        }
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
      take: limit,
    });
    
    // Check if there are more sessions after
    const countAfter = await prisma.chatSession.count({
      where: {
        userId: session.user.id,
        type: type as any,
        updatedAt: {
          lt: sessions.length > 0 
            ? sessions[sessions.length - 1].updatedAt 
            : referenceSession.updatedAt
        }
      }
    });
    
    return NextResponse.json({ 
      sessions,
      hasMore: countAfter > 0
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
