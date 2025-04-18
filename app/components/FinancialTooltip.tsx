import { useState } from 'react';

interface FinancialTooltipProps {
  term: string;
  explanation: string;
}

export default function FinancialTooltip({ term, explanation }: FinancialTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {term}
        <svg
          className="w-4 h-4 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
      {showTooltip && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg">
          {explanation}
        </div>
      )}
    </div>
  );
} 