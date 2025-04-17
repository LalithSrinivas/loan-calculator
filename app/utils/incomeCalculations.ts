import Decimal from 'decimal.js';

/**
 * Interface defining the parameters required for income growth calculations
 */
export interface IncomeParams {
  initialAmount: number;          // Initial investment amount
  periodicContribution: number;   // Amount contributed periodically
  contributionFrequency: 'monthly' | 'quarterly' | 'annually' | 'one-time'; // How often contributions are made
  annualGrowthRate: number;       // Expected annual growth rate in percentage
  timeHorizonMonths: number;      // Investment duration in months
}

/**
 * Interface representing a single row in the income growth schedule
 */
export interface IncomeScheduleRow {
  month: number;                  // Month number in the schedule
  startingBalance: number;        // Balance at the start of the month
  contribution: number;           // Contribution made in this month
  growth: number;                 // Growth amount for this month
  endingBalance: number;          // Balance at the end of the month
}

/**
 * Interface representing the summary of income growth calculations
 */
export interface IncomeSummary {
  finalBalance: number;           // Final balance after all periods
  totalContributions: number;     // Total amount contributed
  totalGrowth: number;            // Total growth achieved
}

/**
 * Calculates the future value of an investment with periodic contributions
 * @param params - Investment parameters including initial amount, contributions, and growth rate
 * @returns Array of schedule rows showing month-by-month growth
 */
export function calculateFutureValue(params: IncomeParams): IncomeScheduleRow[] {
  const {
    initialAmount,
    periodicContribution,
    contributionFrequency,
    annualGrowthRate,
    timeHorizonMonths
  } = params;

  // Convert annual growth rate to monthly rate
  const monthlyRate = Math.pow(1 + annualGrowthRate / 100, 1 / 12) - 1;
  const schedule: IncomeScheduleRow[] = [];
  let currentBalance = initialAmount;

  // Calculate growth for each month
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

    // Calculate growth for the month
    const growth = (startingBalance + contribution) * monthlyRate;
    const endingBalance = startingBalance + contribution + growth;
    currentBalance = endingBalance;

    // Add this month's data to the schedule
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

/**
 * Calculates summary statistics for an income growth schedule
 * @param schedule - Array of schedule rows from calculateFutureValue
 * @returns Summary object with final balance, total contributions, and total growth
 */
export function calculateIncomeSummary(schedule: IncomeScheduleRow[]): IncomeSummary {
  if (schedule.length === 0) {
    return {
      finalBalance: 0,
      totalContributions: 0,
      totalGrowth: 0
    };
  }

  // Get the final row for final balance
  const finalRow = schedule[schedule.length - 1];
  
  // Calculate total contributions and growth
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