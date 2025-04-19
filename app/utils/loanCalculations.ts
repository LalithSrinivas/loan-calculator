import Decimal from 'decimal.js';

export interface LoanParams {
  loanAmount: number;
  annualInterestRate: number;
  loanTenureMonths: number;
  extraPayment: number;
  extraPaymentFrequency: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  extraPaymentStartMonth: number;
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

export function calculateEMI(params: LoanParams): number {
  const principal = Math.max(0, params.loanAmount);
  const ratePerMonth = (params.annualInterestRate / 12) / 100;
  const tenure = Math.max(1, params.loanTenureMonths);

  if (principal === 0 || tenure === 0) return 0;
  if (params.annualInterestRate === 0) return principal / tenure;

  const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenure)) / 
              (Math.pow(1 + ratePerMonth, tenure) - 1);
  
  return isFinite(emi) ? emi : 0;
}

export function generateAmortizationSchedule(params: LoanParams): AmortizationRow[] {
  const emi = calculateEMI(params);
  if (emi === 0) return [];

  const schedule: AmortizationRow[] = [];
  let remainingBalance = params.loanAmount;
  let month = 1;

  while (remainingBalance > 0 && month <= params.loanTenureMonths) {
    const ratePerMonth = (params.annualInterestRate / 12) / 100;
    const interest = remainingBalance * ratePerMonth;
    let principal = emi - interest;
    let extraPayment = 0;

    // Calculate extra payment if applicable
    if (month >= params.extraPaymentStartMonth) {
      switch (params.extraPaymentFrequency) {
        case 'monthly':
          extraPayment = params.extraPayment;
          break;
        case 'quarterly':
          if ((month - params.extraPaymentStartMonth) % 3 === 0) {
            extraPayment = params.extraPayment;
          }
          break;
        case 'semiannually':
          if ((month - params.extraPaymentStartMonth) % 6 === 0) {
            extraPayment = params.extraPayment;
          }
          break;
        case 'annually':
          if ((month - params.extraPaymentStartMonth) % 12 === 0) {
            extraPayment = params.extraPayment;
          }
          break;
      }
    }

    // Adjust principal payment with extra payment
    principal += extraPayment;

    // Ensure we don't overpay
    if (principal > remainingBalance) {
      principal = remainingBalance;
    }

    remainingBalance -= principal;

    schedule.push({
      month,
      payment: Number(new Decimal(emi).toFixed(2)),
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      remainingBalance: Number(remainingBalance.toFixed(2)),
      extraPayment: Number(extraPayment.toFixed(2)),
      totalPayment: Number(new Decimal(emi).toFixed(2))
    });

    month++;
  }

  return schedule;
}

export function calculateLoanSummary(schedule: AmortizationRow[]) {
  if (!schedule || schedule.length === 0) {
    return {
      monthlyEMI: 0,
      totalPayments: 0,
      totalInterest: 0,
      totalExtraPayments: 0,
      totalTenureMonths: 0
    };
  }

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalExtraPayments = schedule.reduce((sum, row) => sum + row.extraPayment, 0);
  const totalPayments = schedule.reduce((sum, row) => sum + row.principal + row.interest, 0);
  const totalTenureMonths = schedule.length;

  return {
    monthlyEMI: schedule[0].payment,
    totalPayments,
    totalInterest,
    totalExtraPayments,
    totalTenureMonths
  };
}

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

interface LoanScheduleParams {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  extraPayment: number;
  extraPaymentFrequency: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
}

interface MonthlyLoanData {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export function calculateLoanSchedule(params: LoanScheduleParams): MonthlyLoanData[] {
  const monthlyRate = params.annualRate / 12 / 100;
  const emi = calculateEMI({
    loanAmount: params.principal,
    annualInterestRate: params.annualRate,
    loanTenureMonths: params.tenureMonths,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly',
    extraPaymentStartMonth: 1
  });
  
  let data: MonthlyLoanData[] = [];
  let remainingBalance = params.principal;

  for (let month = 0; month <= params.tenureMonths && remainingBalance > 0; month++) {
    const interest = remainingBalance * monthlyRate;
    let principalComponent = emi - interest;
    
    // Calculate extra payment for this month
    let extraPayment = 0;
    if (params.extraPayment > 0) {
      if (params.extraPaymentFrequency === 'monthly' ||
         (params.extraPaymentFrequency === 'quarterly' && month % 3 === 0) ||
         (params.extraPaymentFrequency === 'semiannually' && month % 6 === 0) ||
         (params.extraPaymentFrequency === 'annually' && month % 12 === 0)) {
        extraPayment = Math.min(params.extraPayment, remainingBalance - principalComponent);
      }
    }

    // Adjust principal component if it's more than remaining balance
    principalComponent = Math.min(principalComponent, remainingBalance);
    
    // Calculate total payment and new balance
    const totalPayment = principalComponent + interest + extraPayment;
    remainingBalance = Math.max(0, remainingBalance - principalComponent - extraPayment);

    data.push({
      month,
      emi,
      principal: principalComponent,
      interest,
      extraPayment,
      totalPayment,
      remainingBalance
    });

    // Break if loan is fully paid
    if (remainingBalance === 0) break;
  }

  return data;
}

export function getExtraPaymentImpact(params: LoanParams): {
  interestSaved: number;
  tenureReduced: number;
} {
    const schedule = generateAmortizationSchedule(params);
    const summary = calculateLoanSummary(schedule);
    const paramsWithoutExtraPayment = { ...params, extraPayment: 0 };
    const scheduleWithoutExtraPayment = generateAmortizationSchedule(paramsWithoutExtraPayment);
    const summaryWithoutExtraPayment = calculateLoanSummary(scheduleWithoutExtraPayment);
    
    return {
      interestSaved: summaryWithoutExtraPayment.totalInterest - summary.totalInterest,
      tenureReduced: summaryWithoutExtraPayment.totalTenureMonths - summary.totalTenureMonths
    };
}