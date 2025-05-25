// app/(chat)/summary/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import SessionList from "@/components/session/SessionList";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  // Parse pagination params from query params
  const currentPage = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "6"); // Default to 6 items per page
  const offset = (currentPage - 1) * limit;
  
  // Get total count for pagination
  const totalSessions = await prisma.chatSession.count({
    where: {
      userId: session.user.id,
      type: "SUMMARY"
    }
  });
  
  const totalPages = Math.ceil(totalSessions / limit);
  
  // Fetch sessions for current page
  const summarySessions = await prisma.chatSession.findMany({
    where: {
      userId: session.user.id,
      type: "SUMMARY"
    },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          fileName: true
        }
      },
      _count: {
        select: { messages: true }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    skip: offset,
    take: limit
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <PageHeader
          title="Summary Sessions"
          description="Chat with AI about your documents and get concise summaries"
          action={
            <Link 
              href="/summary/new" 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Session
            </Link>
          }
          className="text-gray-800 mb-12"
        />
        
        {summarySessions.length > 0 ? (
          <>
            <SessionList sessions={summarySessions} type="summary" />
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  baseUrl="/summary" 
                  limit={limit}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No summary sessions yet"
            description="Upload a document to start a new summary session with our AI"
            action={{
              label: "Upload Document",
              href: "/summary/new"
            }}
            icon={
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
