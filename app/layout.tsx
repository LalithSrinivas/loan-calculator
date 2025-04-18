import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';
import Logo from './components/Logo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Loan Calculator',
  description: 'Compare loan scenarios and plan your financial future',
  metadataBase: new URL('https://lalithsrinivas.github.io/loan-calculator'),
};

const navigation = [
  { name: 'Loan Calculator', href: '/' },
  { name: 'Income Growth', href: '/income' },
  { name: 'Compound Growth', href: '/compound' },
  { name: 'Financial Glossary', href: '/glossary' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/loan-calculator/favicon.ico" />
      </head>
      <body className={`h-full ${inter.className}`}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Logo />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Loan & Investment Calculator
                </h1>
                <p className="text-sm text-gray-500">
                  Plan your financial future with confidence
                </p>
              </div>
            </div>
          </div>
        </header>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
} 