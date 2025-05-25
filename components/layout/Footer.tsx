// components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 font-medium">
              © {new Date().getFullYear()} Study Fetch. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
