// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-white p-12 rounded-xl shadow-md max-w-lg">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">New features are being added soon.</p>
          <p className="text-gray-600">Please revisit later or check your URL again.</p>
        </div>
        
        <div className="w-16 h-1 bg-blue-100 mx-auto my-6"></div>
        
        <Link 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
