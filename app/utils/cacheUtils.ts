export interface LoanCachedTabState {
  loanAmount: number;
  annualInterestRate: number;
  loanTenureMonths: number;
  extraPayment: number;
  extraPaymentFrequency: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  extraPaymentStartMonth: number;
}

export interface IncomeGrowthCachedTabState {
  initialAmount: number;
  monthlyContribution: number;
  contributionFrequency: 'monthly' | 'annually';
  annualGrowthRate: number;
  timeHorizonMonths: number;
  annualInflationRate?: number;
  taxBracket?: number;
}

export interface CompoundScenarioCachedTabState {
  // Loan Parameters
  loanAmount: number;
  annualInterestRate: number;
  loanTenureMonths: number;
  extraPayment: number;
  extraPaymentFrequency: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  extraPaymentStartMonth: number;
  // Income Parameters
  initialAmount: number;
  monthlyContribution: number;
  contributionFrequency: 'monthly' | 'annually';
  annualGrowthRate: number;
  timeHorizonMonths: number;
}

type CachedTabState = LoanCachedTabState | IncomeGrowthCachedTabState | CompoundScenarioCachedTabState;

const STORAGE_KEY = 'loan_calculator_tab_state';

export const saveTabState = (tabId: string, state: CachedTabState) => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const data = existingData ? JSON.parse(existingData) : {};
    data[tabId] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving tab state:', error);
  }
};

export const loadTabState = <T extends CachedTabState>(tabId: string): T | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsedData = JSON.parse(data);
    return parsedData[tabId] || null;
  } catch (error) {
    console.error('Error loading tab state:', error);
    return null;
  }
};

export const clearTabState = (tabId: string) => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) return;
    const data = JSON.parse(existingData);
    delete data[tabId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error clearing tab state:', error);
  }
}; 