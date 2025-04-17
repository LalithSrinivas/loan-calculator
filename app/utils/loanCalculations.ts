import Decimal from 'decimal.js';

export interface LoanParams {
  loanAmount: number;
  annualInterestRate: number;
  loanTenureMonths: number;
  extraPayment?: number;
  extraPaymentFrequency?: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  extraPaymentStartMonth?: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  extraPayment: number;
  totalPayment: number;
}

export const calculateEMI = (params: LoanParams): number => {
  const P = new Decimal(params.loanAmount);
  const r = new Decimal(params.annualInterestRate / 12 / 100); // Monthly interest rate
  const n = new Decimal(params.loanTenureMonths);
  
  const emi = P.times(r.times((Decimal.pow(r.plus(1), n))))
    .dividedBy(Decimal.pow(r.plus(1), n).minus(1));
    
  return Number(emi.toFixed(2));
};

export const generateAmortizationSchedule = (params: LoanParams): AmortizationRow[] => {
  const schedule: AmortizationRow[] = [];
  let remainingBalance = new Decimal(params.loanAmount);
  const monthlyInterestRate = new Decimal(params.annualInterestRate / 12 / 100);
  const baseEMI = calculateEMI(params);
  const startMonth = params.extraPaymentStartMonth || 1;

  for (let month = 1; month <= params.loanTenureMonths && remainingBalance.greaterThan(0); month++) {
    const interest = remainingBalance.times(monthlyInterestRate);
    let principal = new Decimal(baseEMI).minus(interest);
    let extraPayment = new Decimal(0);

    // Calculate extra payment if enabled and after start month
    if (params.extraPayment && month >= startMonth) {
      const monthsSinceStart = month - startMonth + 1;
      
      switch (params.extraPaymentFrequency) {
        case 'monthly':
          extraPayment = new Decimal(params.extraPayment);
          break;
        case 'quarterly':
          if (monthsSinceStart % 3 === 0) {
            extraPayment = new Decimal(params.extraPayment);
          }
          break;
        case 'semiannually':
          if (monthsSinceStart % 6 === 0) {
            extraPayment = new Decimal(params.extraPayment);
          }
          break;
        case 'annually':
          if (monthsSinceStart % 12 === 0) {
            extraPayment = new Decimal(params.extraPayment);
          }
          break;
      }
    }

    // Adjust principal if it would overpay the loan
    if (principal.plus(extraPayment).greaterThan(remainingBalance)) {
      principal = remainingBalance;
      extraPayment = new Decimal(0);
    }

    remainingBalance = remainingBalance.minus(principal).minus(extraPayment);

    schedule.push({
      month,
      payment: Number(new Decimal(baseEMI).toFixed(2)),
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      remainingBalance: Number(remainingBalance.toFixed(2)),
      extraPayment: Number(extraPayment.toFixed(2)),
      totalPayment: Number(new Decimal(baseEMI).plus(extraPayment).toFixed(2))
    });

    if (remainingBalance.lessThanOrEqualTo(0)) break;
  }

  return schedule;
};

export const calculateLoanSummary = (schedule: AmortizationRow[]) => {
  const totalPayments = schedule.reduce((sum, row) => sum + row.totalPayment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal + row.extraPayment, 0);
  const actualTenure = schedule.length;

  return {
    totalPayments: Number(totalPayments.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPrincipal: Number(totalPrincipal.toFixed(2)),
    actualTenure
  };
};

export const formatIndianCurrency = (value: number): string => {
  // Convert to absolute value for formatting
  const absoluteValue = Math.abs(value);
  
  // Convert to crores if value is >= 1 crore
  if (absoluteValue >= 10000000) {
    const crores = (absoluteValue / 10000000).toFixed(2);
    return `₹${crores}Cr`;
  }
  
  // Convert to lakhs if value is >= 1 lakh
  if (absoluteValue >= 100000) {
    const lakhs = (absoluteValue / 100000).toFixed(2);
    return `₹${lakhs}L`;
  }
  
  // For values less than 1 lakh, use Indian number formatting
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(value);
};
