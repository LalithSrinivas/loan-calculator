'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Loan Terms
  {
    term: 'EMI (Equated Monthly Installment)',
    definition: 'A fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is fully paid off along with interest.',
    category: 'Loans'
  },
  {
    term: 'Principal Amount',
    definition: 'The original sum of money borrowed in a loan or invested in an investment vehicle. This is the base amount on which interest is calculated.',
    category: 'General'
  },
  {
    term: 'Interest Rate',
    definition: 'The percentage of principal charged by the lender for the use of its money. For investments, it represents the rate of return on the investment.',
    category: 'General'
  },
  {
    term: 'Extra Payment',
    definition: 'Additional payment made towards a loan principal beyond the required EMI. This helps reduce the overall interest paid and loan tenure.',
    category: 'Loans'
  },
  {
    term: 'Loan Tenure',
    definition: 'The total duration or term of the loan, typically expressed in months or years. It determines how long you have to repay the loan.',
    category: 'Loans'
  },
  {
    term: 'Amortization Schedule',
    definition: 'A complete table of periodic loan payments showing the amount of principal and interest that comprise each payment until the loan is paid off at the end of its term.',
    category: 'Loans'
  },
  {
    term: 'Remaining Balance',
    definition: 'The amount of principal that remains to be paid on a loan at any given time.',
    category: 'Loans'
  },
  {
    term: 'Loan Cost Ratio',
    definition: 'The ratio of total interest paid to the original loan amount, expressed as a percentage. It helps evaluate the true cost of borrowing.',
    category: 'Loans'
  },
  {
    term: 'Effective Interest Rate',
    definition: 'The actual cost of borrowing when considering compounding and all associated fees, often different from the stated interest rate.',
    category: 'Loans'
  },

  // Investment Terms
  {
    term: 'Compound Interest',
    definition: 'Interest calculated on both the initial principal and the accumulated interest from previous periods. This makes your money grow faster compared to simple interest.',
    category: 'Investments'
  },
  {
    term: 'Initial Investment',
    definition: 'The starting amount you invest, also known as the principal investment. This is the base amount that begins earning returns.',
    category: 'Investments'
  },
  {
    term: 'Monthly Investment',
    definition: 'Regular contributions made to your investment portfolio each month, helping to build wealth through consistent investing.',
    category: 'Investments'
  },
  {
    term: 'Expected Annual Return',
    definition: 'The percentage gain or loss on an investment over a one-year period that you anticipate earning.',
    category: 'Investments'
  },
  {
    term: 'Portfolio Value',
    definition: 'The total market value of all investments held in an investment portfolio at a given time.',
    category: 'Investments'
  },
  {
    term: 'Investment Time Horizon',
    definition: 'The length of time you expect to hold an investment before needing the money, affecting your investment strategy and risk tolerance.',
    category: 'Investments'
  },
  {
    term: 'Passive Income',
    definition: 'Income earned from investments that require minimal ongoing effort to maintain, such as dividend income or interest payments.',
    category: 'Investments'
  },
  {
    term: 'Total Investment Value',
    definition: 'The current worth of your investment, including both your contributions and any returns earned.',
    category: 'Investments'
  },
  {
    term: 'Wealth Accumulation Rate',
    definition: 'The speed at which your investment portfolio grows, calculated as the percentage of earnings relative to total contributions.',
    category: 'Investments'
  },

  // Advanced Financial Concepts
  {
    term: 'Break-even Point',
    definition: 'The point at which total investment returns equal the total loan costs, helping compare investment versus loan prepayment strategies.',
    category: 'Advanced Analysis'
  },
  {
    term: 'Real Return',
    definition: 'The return on investment after accounting for inflation, representing actual purchasing power gains.',
    category: 'Advanced Analysis'
  },
  {
    term: 'Investment vs Loan Ratio',
    definition: 'A comparison metric showing the relative performance of investing versus loan prepayment strategies.',
    category: 'Advanced Analysis'
  },
  {
    term: 'Safe Withdrawal Rate',
    definition: 'The percentage of savings you can withdraw annually without depleting your portfolio, typically 3-4% for retirement planning.',
    category: 'Advanced Analysis'
  },
  {
    term: 'Financial Independence',
    definition: 'The state of having sufficient personal wealth to live without having to work actively for basic necessities.',
    category: 'Advanced Analysis'
  },

  // Economic Factors
  {
    term: 'Inflation Rate',
    definition: 'The rate at which the general level of prices for goods and services rises, consequently decreasing purchasing power over time.',
    category: 'Economics'
  },
  {
    term: 'Tax Bracket',
    definition: 'A range of incomes taxed at a specific rate. Higher income typically falls into higher tax brackets, affecting the after-tax returns on investments.',
    category: 'Taxation'
  },
  {
    term: 'Tax Implications',
    definition: 'The effect of taxes on investment returns or loan interest deductions, important for calculating actual gains or savings.',
    category: 'Taxation'
  },
  {
    term: 'Tax Deduction',
    definition: 'An expense you can subtract from your taxable income, such as home loan interest, reducing your overall tax liability.',
    category: 'Taxation'
  },

  // Investment Vehicles
  {
    term: 'Fixed Deposit (FD)',
    definition: 'A financial instrument provided by banks which provides investors a higher rate of interest than a regular savings account, until the given maturity date.',
    category: 'Investment Products'
  },
  {
    term: 'Public Provident Fund (PPF)',
    definition: 'A long-term investment scheme backed by the Government of India which offers tax benefits and guaranteed returns.',
    category: 'Investment Products'
  },
  {
    term: 'National Pension System (NPS)',
    definition: 'A government-sponsored pension scheme that encourages people to invest in a pension account at regular intervals during their employment.',
    category: 'Investment Products'
  },
  {
    term: 'Systematic Investment Plan (SIP)',
    definition: 'A method of investing a fixed amount regularly in mutual funds, similar to recurring deposits in banks.',
    category: 'Investment Products'
  }
];

export default function FinancialGlossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(glossaryTerms.map(term => term.category))];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search financial terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Terms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((term, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {term.term}
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {term.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {term.definition}
              </p>
            </div>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500">No terms found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 