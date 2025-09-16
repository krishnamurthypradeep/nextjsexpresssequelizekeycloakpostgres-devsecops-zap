
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-semibold text-blue-600 hover:text-blue-800"
            >
              Products
            </Link>
            
          </nav>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-6 py-8">
          <Providers>{children}</Providers>
          </main>
      </body>
    </html>
  );
}
