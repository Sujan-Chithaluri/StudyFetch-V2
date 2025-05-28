// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';
import { deletePdfFromBlob } from '@/lib/blob';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;
    
    // Check if document exists and belongs to user
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: session.user.id,
      },
      include: {
        chatSessions: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if document has chat sessions
    if (document.chatSessions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete document with associated chat sessions' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    // Extract filename from URL or use stored filename
    const filename = document.fileUrl.split('/').pop() || '';
    await deletePdfFromBlob(filename);

    // Delete from database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;
    const { content } = await request.json();
    
    // Check if document exists and belongs to user
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update document content
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        content,
      },
    });

    return NextResponse.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
