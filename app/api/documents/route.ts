// app/api/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionType = formData.get('sessionType') as string;
    const contentJson = formData.get('content') as string;
    
    if (!file || !sessionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Parse the content JSON
    let parsedContent;
    try {
      parsedContent = contentJson ? JSON.parse(contentJson) : null;
    } catch (error) {
      console.error("Error parsing content JSON:", error);
      parsedContent = null;
    }
    
    // If no parsed content, use placeholder
    if (!parsedContent) {
      parsedContent = {
        pages: [],
        content: [],
        totalPages: 0,
        needsClientParsing: true
      };
    }
    
    const filename = `${session.user.id}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });
    
    // Create document in database with parsed content
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileUrl: blob.url,
        fileType: file.type,
        title: file.name.replace(/\.[^/.]+$/, ""),
        userId: session.user.id,
        content: parsedContent,
        metadata: {
          pageCount: parsedContent.totalPages || 0,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          parsed: !!parsedContent && !parsedContent.needsClientParsing
        }
      }
    });
    
    // Create chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        title: `${sessionType} - ${document.title}`,
        type: sessionType as any,
        userId: session.user.id,
        documentId: document.id,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      documentId: document.id,
      sessionId: chatSession.id
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json({ 
      error: "Failed to upload document",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
