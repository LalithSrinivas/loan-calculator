# Loan Amortization Calculator

A sophisticated web application for visualizing loan repayment scenarios with advanced features for calculating and comparing different loan parameters.

## Features

- Interactive loan parameter inputs with sliders and text fields
- Real-time calculation of monthly payments and total interest
- Extra payment options with flexible payment frequencies
- Visual representation of payment breakdown and loan balance over time
- Responsive design for all device sizes
- Precise financial calculations using decimal.js

## Technology Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Decimal.js for precise financial calculations
- Headless UI for accessible components

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd loan-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Enter your loan parameters:
   - Loan Amount (between $1,000 and $1,000,000)
   - Annual Interest Rate (between 0.1% and 25%)
   - Loan Tenure (between 1 and 30 years)

2. Optional: Enable extra payments
   - Set extra payment amount
   - Choose payment frequency (Monthly, Quarterly, Semi-Annually, Annually)

3. View results in real-time:
   - Monthly payment amount
   - Total interest paid
   - Payment breakdown chart
   - Loan balance over time

## Development

- `app/components/LoanCalculator.tsx` - Main calculator component
- `app/utils/loanCalculations.ts` - Financial calculation utilities
- `app/page.tsx` - Main page component
- `app/layout.tsx` - Root layout with metadata

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
