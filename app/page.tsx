import LoanCalculator from './components/LoanCalculator';
import { formatCurrency } from './utils/currencyFormatter';

export default function Home() {
  return (
    <main>
      <LoanCalculator />
    </main>
  );
} 