// lib/blob.ts
import { put, del } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function uploadPdfToBlob(file: File, userId: string) {
  try {
    // Generate a unique filename with user ID and timestamp
    const filename = `${userId}/${Date.now()}-${file.name}`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public', // or 'private' if you want to restrict access
      contentType: file.type,
      addRandomSuffix: false, // Set to true for additional uniqueness
    });
    
    return {
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deletePdfFromBlob(filename: string) {
  try {
    await del(filename);
    return true;
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    throw new Error('Failed to delete file');
  }
}
