// lib/ai/provider.ts
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { google } from "@ai-sdk/google";

const mockModel = {
  generate: async () => ({ text: "This is a test response" }),
};

export const aiProvider = customProvider({
  languageModels: {
    "chat-model": google("gemini-2.0-flash"),
    "chat-model-reasoning": wrapLanguageModel({
      model: google("gemini-2.0-flash"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": google("gemini-2.0-flash"),
    "artifact-model": google("gemini-2.0-flash"),
  },
});
