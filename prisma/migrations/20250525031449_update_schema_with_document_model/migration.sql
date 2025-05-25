-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('TUTOR', 'FLASHCARDS', 'SUMMARY');

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'TUTOR';
