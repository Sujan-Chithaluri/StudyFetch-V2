import { Message, generateText } from "ai";
import { anthropic } from '@ai-sdk/anthropic';

export async function generateChatResponse(
  messages: Message[],
  documentContent?: string
): Promise<string> {
  try {
    const prompt =
      messages.filter((m) => m.role === "user").pop()?.content || "";

    const systemPrompt = `
You are an AI tutor. The user has uploaded a study document, and your job is to assist them in learning from it.

Here is the document content:
${documentContent}

Follow these strict rules:
- Answer based only on the content in the document.
- If a question is outside the scope of the document, respond that you cannot answer based on the provided material.
- Be clear, concise, and supportive in tone.
- When referring to parts of the document, use "page[n]" notation (e.g., "as explained on page[3], page[4] and page[6]").
- You may summarize concepts, define terms based on the document.

IMPORTANT: At the end of your response, include ONE of these commands if applicable:

commands:
- Only one page switch: /page/{n} - where n is the page number
- Only one highlight: /highlight/{term} - must be an exact match from the document
- Multiple annotations: /annotate/{n}/{text} - where n is the page number and text is your annotation

Example response format:
"Your detailed answer here with page[n] references.

commands:
/page/2
/highlight/Kalinga War"

OR

"Your detailed answer here with page[n] references.

commands:
/annotate/2/Ashoka's transformation after Kalinga War
/annotate/3/Principles of Dhamma"
`;

    // Format messages for Anthropic
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: [{ type: "text", text: msg.content }]
    }));

    // Generate AI response
    const result = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      system: systemPrompt,
      prompt: prompt,
    });

    // Extract the text from the response
    let responseText = "";
    
    if (typeof result.text === 'string') {
      responseText = result.text;
    } else if (result.text && typeof result.text?.text === 'string') {
      responseText = result.text?.text;
    }

    return responseText;
  } catch (error) {
    console.error("Error in AI generation:", error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
}
