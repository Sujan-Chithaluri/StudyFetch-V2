// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { uploadPdfToBlob } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionType = formData.get('sessionType') as string;
    
    if (!file || !sessionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const blobResult = await uploadPdfToBlob(file, session.user.id);
    
    // Create document in database
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileUrl: blobResult.url,
        fileType: file.type,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
        userId: session.user.id,
        metadata: {
          size: file.size,
          uploadedAt: new Date().toISOString(),
        }
      }
    });
    
    // Create chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        title: `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1).toLowerCase()} - ${document.title}`,
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
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
