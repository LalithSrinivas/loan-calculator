interface TaxBracket {
  range: [number, number];
  rate: number;
}

const TAX_BRACKETS: TaxBracket[] = [
  { range: [0, 250000], rate: 0 },
  { range: [250000, 500000], rate: 5 },
  { range: [500000, 750000], rate: 10 },
  { range: [750000, 1000000], rate: 15 },
  { range: [1000000, 1250000], rate: 20 },
  { range: [1250000, 1500000], rate: 25 },
  { range: [1500000, Infinity], rate: 30 }
];

interface AdvancedMetrics {
  // Loan Analysis
  totalInterestPaid: number;
  effectiveInterestRate: number;
  loanCostRatio: number;
  totalLoanPayment: number;

  // Investment Analysis
  totalInvestmentValue: number;
  totalContributions: number;
  totalEarnings: number;
  effectiveReturnRate: number;

  // Comparative Analysis
  investmentVsLoanRatio: number;
  breakevenPoint: number;
  realReturnAfterInflation: number;
  wealthAccumulationRate: number;
}

interface AdvancedAnalysisParams {
  // Loan Details
  loanAmount: number;
  loanInterestRate: number;
  loanTenureMonths: number;
  monthlyEMI: number;

  // Investment Details
  initialAmount: number;
  monthlyInvestment: number;
  expectedReturn: number;

  // Economic Factor
  inflationRate: number;
}

export function calculateAdvancedMetrics(params: AdvancedAnalysisParams): AdvancedMetrics {
  // Loan Calculations
  const totalLoanPayment = params.monthlyEMI * params.loanTenureMonths;
  const totalInterestPaid = totalLoanPayment - params.loanAmount;
  const effectiveInterestRate = (totalInterestPaid / params.loanAmount) * 100 / (params.loanTenureMonths / 12);
  const loanCostRatio = totalInterestPaid / params.loanAmount * 100;

  // Investment Calculations
  const monthlyRate = params.expectedReturn / 12 / 100;
  const totalInvestmentValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyInvestment,
    monthlyRate,
    params.loanTenureMonths
  );
  const totalContributions = params.initialAmount + (params.monthlyInvestment * params.loanTenureMonths);
  const totalEarnings = totalInvestmentValue - totalContributions;
  const effectiveReturnRate = (Math.pow(totalInvestmentValue / totalContributions, 12 / params.loanTenureMonths) - 1) * 100;

  // Comparative Analysis
  const investmentVsLoanRatio = totalInvestmentValue / totalLoanPayment * 100;
  const breakevenPoint = calculateBreakEvenPoint(params);
  const realReturnAfterInflation = params.expectedReturn - (params.inflationRate || 6);
  const wealthAccumulationRate = (totalEarnings / totalContributions) * 100;

  return {
    totalInterestPaid,
    effectiveInterestRate,
    loanCostRatio,
    totalLoanPayment,
    totalInvestmentValue,
    totalContributions,
    totalEarnings,
    effectiveReturnRate,
    investmentVsLoanRatio,
    breakevenPoint,
    realReturnAfterInflation,
    wealthAccumulationRate
  };
}

function calculateTaxSavings(interestPaid: number): number {
  let taxSaving = 0;
  let remainingAmount = Math.min(interestPaid, 200000); // Max deduction under 24(b)

  for (const bracket of TAX_BRACKETS) {
    const amountInBracket = Math.min(
      remainingAmount,
      bracket.range[1] - bracket.range[0]
    );
    if (amountInBracket <= 0) break;
    
    taxSaving += (amountInBracket * bracket.rate) / 100;
    remainingAmount -= amountInBracket;
  }

  return taxSaving;
}

function calculateYearlyTax(income: number): number {
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of TAX_BRACKETS) {
    const amountInBracket = Math.min(
      remainingIncome,
      bracket.range[1] - bracket.range[0]
    );
    if (amountInBracket <= 0) break;
    
    tax += (amountInBracket * bracket.rate) / 100;
    remainingIncome -= amountInBracket;
  }

  return tax;
}

function calculateSafeWithdrawalRate(riskTolerance: 'conservative' | 'moderate' | 'aggressive'): number {
  switch (riskTolerance) {
    case 'conservative': return 3;
    case 'moderate': return 4;
    case 'aggressive': return 5;
  }
}

function calculateROI(params: AdvancedAnalysisParams): number {
  const totalInvestment = params.initialAmount + (params.monthlyInvestment * params.loanTenureMonths);
  const finalAmount = calculateFutureValue(
    params.initialAmount,
    params.monthlyInvestment,
    params.expectedReturn / 12,
    params.loanTenureMonths
  );
  return ((finalAmount - totalInvestment) / totalInvestment) * 100;
}

function calculateBreakEvenPoint(params: AdvancedAnalysisParams): number {
  let month = 0;
  let investmentValue = params.initialAmount;
  let loanBalance = params.loanAmount;
  const monthlyRate = params.expectedReturn / 12 / 100;
  
  while (investmentValue < loanBalance && month < params.loanTenureMonths) {
    investmentValue = investmentValue * (1 + monthlyRate) + params.monthlyInvestment;
    loanBalance = calculateRemainingLoanBalance(
      params.loanAmount,
      params.loanInterestRate,
      params.loanTenureMonths,
      month
    );
    month++;
  }
  
  return month;
}

function calculateYearsToFI(
  annualExpenses: number,
  annualSavings: number,
  realReturn: number
): number {
  const targetCorpus = annualExpenses * 25; // Using 4% rule
  const monthlyRate = realReturn / 12 / 100;
  let months = 0;
  let corpus = 0;

  while (corpus < targetCorpus && months < 600) { // Max 50 years
    corpus = corpus * (1 + monthlyRate) + (annualSavings / 12);
    months++;
  }

  return months / 12;
}

function calculateRetirementCorpus(
  monthlyExpenses: number,
  inflationRate: number,
  expectedReturn: number,
  yearsToRetirement: number
): number {
  const annualExpenses = monthlyExpenses * 12;
  const inflationAdjustedExpenses = annualExpenses * Math.pow(1 + inflationRate/100, yearsToRetirement);
  return inflationAdjustedExpenses * 25; // Using 4% rule
}

function calculateRequiredMonthlyInvestment(
  targetAmount: number,
  initialAmount: number,
  annualReturn: number,
  months: number
): number {
  const r = annualReturn / 12 / 100;
  const denominator = ((Math.pow(1 + r, months) - 1) / r);
  return (targetAmount - initialAmount * Math.pow(1 + r, months)) / denominator;
}

function comparePrePaymentVsInvestment(
  loanAmount: number,
  loanRate: number,
  investmentReturn: number,
  tenureMonths: number
): number {
  const prepaymentSavings = loanAmount * (loanRate/100) * (tenureMonths/12);
  const investmentGains = calculateFutureValue(
    loanAmount,
    0,
    investmentReturn/12,
    tenureMonths
  ) - loanAmount;
  return investmentGains - prepaymentSavings;
}

function calculatePotentialReturns(
  monthlyInvestment: number,
  annualReturn: number,
  months: number
): number {
  return calculateFutureValue(0, monthlyInvestment, annualReturn/12, months);
}

function calculateFDReturns(
  monthlyInvestment: number,
  fdRate: number,
  months: number
): number {
  return calculateFutureValue(0, monthlyInvestment, fdRate/12, months);
}

function calculateFutureValue(
  principal: number,
  monthlyContribution: number,
  monthlyRate: number,
  months: number
): number {
  const principalGrowth = principal * Math.pow(1 + monthlyRate, months);
  const contributionGrowth = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return principalGrowth + contributionGrowth;
}

export function calculateRemainingLoanBalance(
  principal: number,
  annualRate: number,
  totalMonths: number,
  currentMonth: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
              (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const remainingPayments = totalMonths - currentMonth;
  return (emi * ((Math.pow(1 + monthlyRate, remainingPayments) - 1) /
          (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments))));
} 