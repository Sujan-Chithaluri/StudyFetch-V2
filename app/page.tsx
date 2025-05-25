export const dynamic = "force-dynamic"; // This disables SSG and ISR

import Link from "next/link";

export default async function Home() {
  // Define the feature cards for the AI tutor app
  const features = [
    {
      title: "AI Tutor",
      description: "Upload your study materials and chat with our AI tutor to get personalized explanations and answers to your questions.",
      icon: "🤖",
      href: "/tutor",
    },
    {
      title: "Flash Cards",
      description: "Generate smart flash cards from your PDFs to help you memorize key concepts and test your knowledge.",
      icon: "🃏",
      href: "/flashcards",
    },
    {
      title: "Summary",
      description: "Get concise summaries of complex documents to quickly understand the main points and key takeaways.",
      icon: "📝",
      href: "/summary",
    },
    {
      title: "Study Notes",
      description: "Convert your PDFs into organized study notes with highlighted key concepts and explanations.",
      icon: "📚",
      href: "/notes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center py-16 px-8">
      <div className="text-center max-w-3xl mb-16">
        <h1 className="text-5xl font-extrabold mb-6 text-gray-800">
          Your Personal AI Study Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload your study materials and let our AI help you understand, memorize, and master any subject.
        </p>
        <Link 
          href="/tutor" 
          className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Get Started
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 w-full max-w-6xl">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href} className="group">
            <div className="border rounded-xl shadow-md bg-white p-8 hover:shadow-lg transition-shadow duration-300 h-full">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 mb-3">
                {feature.title}
              </h2>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 bg-white p-8 rounded-xl shadow-md max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
        <ol className="space-y-4">
          <li className="flex items-start">
            <span className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-8 h-8 font-bold mr-3 flex-shrink-0">1</span>
            <p className="text-gray-700">Upload your PDF study materials</p>
          </li>
          <li className="flex items-start">
            <span className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-8 h-8 font-bold mr-3 flex-shrink-0">2</span>
            <p className="text-gray-700">Our AI analyzes and processes the content</p>
          </li>
          <li className="flex items-start">
            <span className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-8 h-8 font-bold mr-3 flex-shrink-0">3</span>
            <p className="text-gray-700">Ask questions, generate summaries, or create study materials</p>
          </li>
        </ol>
      </div>
    </div>
  );
}
