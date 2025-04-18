'use client';

import FinancialGlossary from '../components/FinancialGlossary';

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Financial Glossary
          </h1>
          <p className="text-lg text-gray-600">
            Understand financial terms and concepts used throughout the calculators
          </p>
        </div>

        <FinancialGlossary />
      </div>
    </div>
  );
} 