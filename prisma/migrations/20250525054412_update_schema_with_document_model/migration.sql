-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_documentId_fkey";

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
