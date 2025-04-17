import Decimal from 'decimal.js';

export interface IncomeParams {
  initialAmount: number;
  periodicContribution: number;
  contributionFrequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  annualGrowthRate: number;
  timeHorizonMonths: number;
}

export interface IncomeScheduleRow {
  month: number;
  startingBalance: number;
  contribution: number;
  growth: number;
  endingBalance: number;
}

export interface IncomeSummary {
  finalBalance: number;
  totalContributions: number;
  totalGrowth: number;
}

export function calculateFutureValue(params: IncomeParams): IncomeScheduleRow[] {
  const {
    initialAmount,
    periodicContribution,
    contributionFrequency,
    annualGrowthRate,
    timeHorizonMonths
  } = params;

  const monthlyRate = Math.pow(1 + annualGrowthRate / 100, 1 / 12) - 1;
  const schedule: IncomeScheduleRow[] = [];
  let currentBalance = initialAmount;

  for (let month = 1; month <= timeHorizonMonths; month++) {
    const startingBalance = currentBalance;
    let contribution = 0;

    // Calculate contribution based on frequency
    switch (contributionFrequency) {
      case 'monthly':
        contribution = periodicContribution;
        break;
      case 'quarterly':
        if (month % 3 === 1) contribution = periodicContribution;
        break;
      case 'annually':
        if (month % 12 === 1) contribution = periodicContribution;
        break;
      case 'one-time':
        if (month === 1) contribution = periodicContribution;
        break;
    }

    const growth = (startingBalance + contribution) * monthlyRate;
    const endingBalance = startingBalance + contribution + growth;
    currentBalance = endingBalance;

    schedule.push({
      month,
      startingBalance,
      contribution,
      growth,
      endingBalance
    });
  }

  return schedule;
}

export function calculateIncomeSummary(schedule: IncomeScheduleRow[]): IncomeSummary {
  if (schedule.length === 0) {
    return {
      finalBalance: 0,
      totalContributions: 0,
      totalGrowth: 0
    };
  }

  const finalRow = schedule[schedule.length - 1];
  const totalContributions = schedule.reduce((sum, row) => sum + row.contribution, 0);
  const totalGrowth = schedule.reduce((sum, row) => sum + row.growth, 0);

  return {
    finalBalance: finalRow.endingBalance,
    totalContributions,
    totalGrowth
  };
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
} 