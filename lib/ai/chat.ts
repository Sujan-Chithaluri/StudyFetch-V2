// lib/ai/chat.ts
import { Message, streamText } from 'ai';
import { chatModel } from './models';

export async function generateChatResponse(
  messages: Message[],
  documentContent?: string
) {
  const systemPrompt = documentContent 
    ? `You are an AI tutor helping with a document. Here's the document content to reference:\n\n${documentContent}\n\nPlease answer questions about this document.`
    : "You are an AI tutor helping with learning. Please answer questions clearly and accurately.";
  
  // Convert Message[] to the format expected by streamText
  const formattedMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content
  }));
  
  return streamText({
    model: chatModel,
    messages: [
      { role: 'system', content: systemPrompt },
      ...formattedMessages
    ],
  });
}
