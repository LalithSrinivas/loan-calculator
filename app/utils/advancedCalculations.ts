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
  totalInvestmentContributions: number;
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
  const totalInvestmentContributions = params.initialAmount + (params.monthlyInvestment * params.loanTenureMonths);
  const totalEarnings = totalInvestmentValue - totalInvestmentContributions;
  const effectiveReturnRate = (Math.pow(totalInvestmentValue / totalInvestmentContributions, 12 / params.loanTenureMonths) - 1) * 100;

  // Comparative Analysis
  const investmentVsLoanRatio = totalInvestmentValue / totalLoanPayment * 100;
  const breakevenPoint = calculateBreakEvenPoint(params);
  const realReturnAfterInflation = params.expectedReturn - (params.inflationRate || 6);
  const wealthAccumulationRate = (totalEarnings / totalInvestmentContributions) * 100;

  return {
    totalInterestPaid,
    effectiveInterestRate,
    loanCostRatio,
    totalLoanPayment,
    totalInvestmentValue,
    totalInvestmentContributions: totalInvestmentContributions,
    totalEarnings,
    effectiveReturnRate,
    investmentVsLoanRatio,
    breakevenPoint,
    realReturnAfterInflation,
    wealthAccumulationRate
  };
}

export function calculateTaxSavings(interestPaid: number): number {
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

export function calculateYearlyTax(income: number): number {
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

export function calculateSafeWithdrawalRate(riskTolerance: 'conservative' | 'moderate' | 'aggressive'): number {
  switch (riskTolerance) {
    case 'conservative': return 3;
    case 'moderate': return 4;
    case 'aggressive': return 5;
  }
}

export function calculateROI(params: AdvancedAnalysisParams): number {
  const totalInvestment = params.initialAmount + (params.monthlyInvestment * params.loanTenureMonths);
  if (totalInvestment <= 0) {
    return 0;
  }
  const finalAmount = calculateFutureValue(
    params.initialAmount,
    params.monthlyInvestment,
    params.expectedReturn / 12,
    params.loanTenureMonths
  );
  console.log(finalAmount, totalInvestment);
  return ((finalAmount - totalInvestment) / totalInvestment) * 100;
}

export function calculateBreakEvenPoint(params: AdvancedAnalysisParams): number {
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

export function calculateYearsToFI(
  annualExpenses: number,
  annualSavings: number,
  realReturn: number
): number {
  if (annualSavings <= 0) {
    throw new Error("Annual savings must be greater than 0.");
  }

  const targetCorpus = annualExpenses * 25; // 4% rule
  const monthlyRate = realReturn / 12 / 100;
  let months = 0;
  let corpus = 0;

  const maxMonths = 100 * 12; // 50 years safety cap

  while (corpus < targetCorpus && months < maxMonths) {
    corpus = corpus * (1 + monthlyRate) + (annualSavings / 12);
    months++;
  }

  return months / 12; // Return years (can be fractional)
}


export function calculateRetirementCorpus(
  monthlyExpenses: number,
  inflationRate: number,
  expectedReturn: number,
  yearsToRetirement: number
): number {

  // Step 1: Inflate monthly expenses to retirement
  const inflatedMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Step 2: Convert to annual expenses
  const inflatedAnnualExpenses = inflatedMonthlyExpenses * 12;

  // Step 3: Safe withdrawal rate (as a decimal)
  const safeWithdrawalRate = (expectedReturn - inflationRate) / 100;

  // Step 4: Calculate required corpus
  const requiredCorpus = inflatedAnnualExpenses / safeWithdrawalRate;

  return requiredCorpus;
}


export function calculateRequiredMonthlyInvestment(
  targetAmount: number,
  initialAmount: number,
  annualReturn: number,
  months: number
): number {
  const monthlyRate = annualReturn / 12 / 100;

  if (months <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    // No return — simple case
    return (targetAmount - initialAmount) / months;
  }

  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const numerator = targetAmount - (initialAmount * compoundFactor);
  const denominator = (compoundFactor - 1) / monthlyRate;

  const monthlyInvestment = numerator / denominator;

  return monthlyInvestment;
}

export function comparePrepaymentVsInvestment(
  loanAmount: number,
  loanInterestRateAnnual: number,
  loanTenureMonths: number,
  prepaymentAmountPerPeriod: number,
  prepaymentFrequency: string, // 'monthly' | 'quarterly' | 'semiannually' | 'annually'
  investmentReturnRateAnnual: number
) {
  const frequencyMap = {
    'monthly': 1,
    'quarterly': 3,
    'semiannually': 6,
    'annually': 12
  };

  const monthsPerPeriod = frequencyMap[prepaymentFrequency as keyof typeof frequencyMap];
  if (!monthsPerPeriod) {
    throw new Error("Invalid prepayment frequency");
  }

  const monthlyInterestRate = loanInterestRateAnnual / 12 / 100;
  const periodicInvestmentRate = (investmentReturnRateAnnual / (12 / monthsPerPeriod)) / 100;

  let remainingLoan = loanAmount;
  let totalInterestPaid = 0;
  let months = 0;

  const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenureMonths)) /
              (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1);

  let totalInterestWithoutPrepayment = 0;
  let tempLoan = loanAmount;

  // Calculate total interest without prepayment
  for (let i = 0; i < loanTenureMonths; i++) {
    const interest = tempLoan * monthlyInterestRate;
    const principal = emi - interest;
    tempLoan -= principal;
    totalInterestWithoutPrepayment += interest;
  }

  // Prepayment scenario
  while (remainingLoan > 0 && months < 1000) { // guard against infinite loops
    months++;

    const interest = remainingLoan * monthlyInterestRate;
    let principal = emi - interest;
    remainingLoan -= principal;
    totalInterestPaid += interest;

    if (months % monthsPerPeriod === 0) {
      remainingLoan -= prepaymentAmountPerPeriod;
      if (remainingLoan < 0) remainingLoan = 0;
    }
  }

  const interestSaved = totalInterestWithoutPrepayment - totalInterestPaid;

  // Investment scenario
  let totalInvestment = 0;
  const totalInvestmentValue = calculateFutureValue(0, prepaymentAmountPerPeriod, periodicInvestmentRate, loanTenureMonths);
  totalInvestment = prepaymentAmountPerPeriod * loanTenureMonths;

  const netGainFromInvestment = totalInvestmentValue - totalInvestment;
  console.log(totalInvestmentValue.toFixed(2), totalInvestment.toFixed(2));
  console.log(netGainFromInvestment.toFixed(2));

  const difference = interestSaved - netGainFromInvestment;
  const betterOption = difference > 0 ? 'Prepay Loan' : 'Invest Money';

  return {
    monthsTakenToRepayLoan: months,
    interestSaved: interestSaved,
    netGainFromInvestment: netGainFromInvestment,
    betterOption,
    difference: difference,
    totalInterestPaid: totalInterestPaid,
    totalInterestWithoutPrepayment: totalInterestWithoutPrepayment
  };
}

export function calculateFutureValue(
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