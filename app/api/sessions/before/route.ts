// app/api/sessions/before/route.ts
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
    
    // Get sessions before the reference session
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
        type: type as any,
        updatedAt: {
          gt: referenceSession.updatedAt // Sessions updated after reference (they come before in desc order)
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
    
    // Check if there are more sessions before
    const countBefore = await prisma.chatSession.count({
      where: {
        userId: session.user.id,
        type: type as any,
        updatedAt: {
          gt: sessions.length > 0 
            ? sessions[0].updatedAt 
            : referenceSession.updatedAt
        }
      }
    });
    
    return NextResponse.json({ 
      sessions,
      hasMore: countBefore > 0
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
