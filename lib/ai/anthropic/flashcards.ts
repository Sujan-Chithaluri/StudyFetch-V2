// lib/ai/anthropic/flashcards.ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamObject } from 'ai';
import { z } from 'zod';

export const flashcardSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct."
    ),
  correctAnswer: z.string()
    .describe(
      "The correct answer, which must be one of the options."
    ),
  explanation: z.string()
    .describe(
      "Explanation of why the correct answer is right."
    )
});

export type Flashcard = z.infer<typeof flashcardSchema>;

export const flashcardSetSchema = z.object({
  title: z.string().describe("A concise, descriptive title for this set of flashcards"),
  flashcards: z.array(flashcardSchema).min(5).max(10)
});

export type FlashcardSet = z.infer<typeof flashcardSetSchema>;