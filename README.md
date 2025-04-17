# Loan Calculator

A comprehensive financial calculator application built with Next.js and TypeScript that helps users calculate and visualize various financial scenarios including loans, investments, and compound interest.

## Features

### 1. Loan Calculator
- Calculate monthly EMI (Equated Monthly Installment)
- Visualize loan amortization schedule
- Track principal and interest payments over time
- Support for extra payments with different frequencies
- Detailed breakdown of total interest and principal payments

### 2. Income Growth Calculator
- Calculate future value of investments
- Support for different contribution frequencies (monthly, quarterly, annually, one-time)
- Visualize investment growth over time
- Track contributions vs. growth
- Detailed summary of final balance and total growth

### 3. Compound Scenario Calculator
- Combine loan and investment scenarios
- Calculate net possession over time
- Track loan balance vs. investment growth
- Visualize when loan will be paid off
- Identify when net possession becomes positive

## Tech Stack

- **Frontend Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **UI Components**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks
- **Form Handling**: React controlled components
- **Styling**: Tailwind CSS with custom components

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/loan-calculator.git
cd loan-calculator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
loan-calculator/
├── app/
│   ├── components/         # Reusable React components
│   ├── utils/             # Utility functions and calculations
│   ├── page.tsx           # Home page
│   ├── income/            # Income growth calculator
│   ├── compare/           # Loan comparison calculator
│   └── compound/          # Compound scenario calculator
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Key Components

### Loan Calculator
- `LoanCalculator.tsx`: Main component for loan calculations
- `loanCalculations.ts`: Utility functions for loan calculations

### Income Growth Calculator
- `income/page.tsx`: Main component for investment calculations
- `incomeCalculations.ts`: Utility functions for investment calculations

### Compound Scenario Calculator
- `compound/page.tsx`: Main component for combined scenarios
- Combines functionality from both loan and investment calculators

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Recharts](https://recharts.org/) for beautiful data visualization
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS framework
