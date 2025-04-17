'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  IncomeParams,
  calculateFutureValue,
  calculateIncomeSummary,
} from '../utils/incomeCalculations';
import {
  formatCurrency
} from '../utils/currencyFormatter';
import {
  LoanParams,
  generateAmortizationSchedule,
  calculateLoanSummary,
} from '../utils/loanCalculations';

interface CombinedParams {
  loan: LoanParams;
  income: IncomeParams;
  timeHorizonMonths: number;
}

interface DataPoint {
  month: number;
  loanBalance: number;
  incomeBalance: number;
  netPossession: number;
}

const STORAGE_KEY = 'compound-scenario-state';

export default function CompoundScenario() {
  const [params, setParams] = useState<CombinedParams>(() => {
    // Try to load saved state from localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    }
    
    // Default state if nothing is saved
    return {
      loan: {
        loanAmount: 5000000,
        annualInterestRate: 8.5,
        loanTenureMonths: 240,
        extraPayment: 0,
        extraPaymentFrequency: 'monthly',
        extraPaymentStartMonth: 1
      },
      income: {
        initialAmount: 100000,
        periodicContribution: 10000,
        contributionFrequency: 'monthly',
        annualGrowthRate: 8,
        timeHorizonMonths: 240,
      },
      timeHorizonMonths: 240,
    };
  });

  const [loanSchedule, setLoanSchedule] = useState<any[]>([]);
  const [incomeSchedule, setIncomeSchedule] = useState<any[]>([]);
  const [netPossessionSchedule, setNetPossessionSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    }
  }, [params]);

  useEffect(() => {
    const loanSchedule = generateAmortizationSchedule(params.loan);
    const incomeSchedule = calculateFutureValue(params.income);
    
    // Calculate the maximum months needed
    const maxMonths = Math.max(
      params.loan.loanTenureMonths,
      params.income.timeHorizonMonths,
      params.timeHorizonMonths
    );
    
    // Calculate net possession schedule
    const netSchedule = Array.from({ length: maxMonths }, (_, i) => {
      // Get loan balance - continue calculation until loan is fully paid
      const loanBalance = i < loanSchedule.length ? loanSchedule[i].remainingBalance : 0;

      // Get income balance - keep last value after income tenure ends
      const lastIncomeBalance = incomeSchedule.length > 0 ? 
        incomeSchedule[incomeSchedule.length - 1].endingBalance : 0;
      const incomeBalance = i < incomeSchedule.length ? 
        incomeSchedule[i].endingBalance : lastIncomeBalance;
      
      return {
        month: i + 1,
        loanBalance,
        incomeBalance,
        netPossession: incomeBalance - loanBalance
      };
    });

    setLoanSchedule(loanSchedule);
    setIncomeSchedule(incomeSchedule);
    setNetPossessionSchedule(netSchedule);

    // Calculate summary metrics
    const loanSummary = calculateLoanSummary(loanSchedule);
    const incomeSummary = calculateIncomeSummary(incomeSchedule);
    const finalNetPossession = netSchedule[netSchedule.length - 1].netPossession;
    const firstPositiveMonth = netSchedule.findIndex(row => row.netPossession > 0) + 1;
    const loanPaidOffMonth = loanSchedule.findIndex(row => row.remainingBalance <= 0);

    setSummary({
      finalNetPossession,
      firstPositiveMonth,
      loanPaidOffMonth: loanPaidOffMonth === -1 ? null : loanPaidOffMonth + 1,
      loanSummary,
      incomeSummary
    });
  }, [params]);

  const handleLoanInputChange = (field: keyof LoanParams, value: number) => {
    setParams(prev => ({
      ...prev,
      loan: {
        ...prev.loan,
        [field]: value
      }
    }));
  };

  const handleIncomeInputChange = (field: keyof IncomeParams, value: number | string) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    setParams(prev => ({
      ...prev,
      income: {
        ...prev.income,
        [field]: numericValue
      },
      // If changing income's timeHorizonMonths, update the overall timeHorizonMonths too
      ...(field === 'timeHorizonMonths' ? { timeHorizonMonths: numericValue } : {})
    }));
  };

  const handleTimeHorizonChange = (years: number) => {
    const months = years * 12;
    setParams(prev => ({
      ...prev,
      timeHorizonMonths: months,
      income: {
        ...prev.income,
        timeHorizonMonths: months // Update income's time horizon as well
      }
    }));
  };

  const getGraphData = () => {
    // Get the maximum months from all sources
    const maxMonths = Math.max(
      params.loan.loanTenureMonths,
      params.income.timeHorizonMonths,
      params.timeHorizonMonths
    );
    
    // Create yearly data points up to the maximum months
    const yearlyData = [];
    for (let month = 0; month <= maxMonths; month += 12) {
      const dataPoint: DataPoint = {
        month,
        // For loan balance, use 0 if beyond loan tenure
        loanBalance: month < params.loan.loanTenureMonths ? 
          (netPossessionSchedule[month]?.loanBalance || 0) : 0,
        // For income balance, use the last available value
        incomeBalance: month < params.income.timeHorizonMonths ?
          (netPossessionSchedule[month]?.incomeBalance || 0) :
          (netPossessionSchedule[Math.min(month, netPossessionSchedule.length - 1)]?.incomeBalance || 0),
        netPossession: 0
      };

      // Calculate net possession based on current loan and income balances
      dataPoint.netPossession = dataPoint.incomeBalance - dataPoint.loanBalance;

      yearlyData.push({
        year: Math.floor(month / 12),
        loanBalance: dataPoint.loanBalance,
        incomeBalance: dataPoint.incomeBalance,
        netPossession: dataPoint.netPossession,
        loanBalanceFormatted: formatCurrency(dataPoint.loanBalance),
        incomeBalanceFormatted: formatCurrency(dataPoint.incomeBalance),
        netPossessionFormatted: formatCurrency(dataPoint.netPossession)
      });
    }

    // Add the final month if it's not already included
    const finalMonth = maxMonths;
    if (finalMonth % 12 !== 0) {
      const finalDataPoint: DataPoint = {
        month: finalMonth,
        loanBalance: finalMonth < params.loan.loanTenureMonths ?
          (netPossessionSchedule[finalMonth - 1]?.loanBalance || 0) : 0,
        incomeBalance: finalMonth < params.income.timeHorizonMonths ?
          (netPossessionSchedule[finalMonth - 1]?.incomeBalance || 0) :
          (netPossessionSchedule[Math.min(finalMonth - 1, netPossessionSchedule.length - 1)]?.incomeBalance || 0),
        netPossession: 0
      };

      finalDataPoint.netPossession = finalDataPoint.incomeBalance - finalDataPoint.loanBalance;

      yearlyData.push({
        year: Math.floor(finalMonth / 12),
        loanBalance: finalDataPoint.loanBalance,
        incomeBalance: finalDataPoint.incomeBalance,
        netPossession: finalDataPoint.netPossession,
        loanBalanceFormatted: formatCurrency(finalDataPoint.loanBalance),
        incomeBalanceFormatted: formatCurrency(finalDataPoint.incomeBalance),
        netPossessionFormatted: formatCurrency(finalDataPoint.netPossession)
      });
    }

    return yearlyData;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Net Possession Scenario
          </h1>
          <p className="text-lg text-gray-600">
            Analyze your financial position by combining loan repayment with investment growth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-8">
            {/* Loan Inputs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Loan Parameters</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="10000000"
                    step="100000"
                    value={params.loan.loanAmount}
                    onChange={(e) => handleLoanInputChange('loanAmount', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="number"
                      value={params.loan.loanAmount}
                      onChange={(e) => handleLoanInputChange('loanAmount', parseInt(e.target.value))}
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {formatCurrency(params.loan.loanAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Interest Rate (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={params.loan.annualInterestRate}
                    onChange={(e) => handleLoanInputChange('annualInterestRate', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={params.loan.annualInterestRate}
                    onChange={(e) => handleLoanInputChange('annualInterestRate', parseFloat(e.target.value))}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (Years)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={params.loan.loanTenureMonths / 12}
                    onChange={(e) => handleLoanInputChange('loanTenureMonths', parseInt(e.target.value) * 12)}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={params.loan.loanTenureMonths / 12}
                    onChange={(e) => handleLoanInputChange('loanTenureMonths', parseInt(e.target.value) * 12)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Payment
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={params.loan.extraPayment || 0}
                    onChange={(e) => handleLoanInputChange('extraPayment', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="number"
                      value={params.loan.extraPayment || 0}
                      onChange={(e) => handleLoanInputChange('extraPayment', parseInt(e.target.value))}
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {formatCurrency(params.loan.extraPayment || 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Payment Frequency
                  </label>
                  <select
                    value={params.loan.extraPaymentFrequency || 'monthly'}
                    onChange={(e) => handleLoanInputChange('extraPaymentFrequency', e.target.value as any)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semiannually">Semi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Income Inputs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Investment Parameters</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Amount
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="10000"
                    value={params.income.initialAmount}
                    onChange={(e) => handleIncomeInputChange('initialAmount', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="number"
                      value={params.income.initialAmount}
                      onChange={(e) => handleIncomeInputChange('initialAmount', e.target.value)}
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {formatCurrency(params.income.initialAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periodic Contribution
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={params.income.periodicContribution}
                    onChange={(e) => handleIncomeInputChange('periodicContribution', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input
                      type="number"
                      value={params.income.periodicContribution}
                      onChange={(e) => handleIncomeInputChange('periodicContribution', e.target.value)}
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {formatCurrency(params.income.periodicContribution)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contribution Frequency
                  </label>
                  <select
                    value={params.income.contributionFrequency}
                    onChange={(e) => handleIncomeInputChange('contributionFrequency', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Growth Rate (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={params.income.annualGrowthRate}
                    onChange={(e) => handleIncomeInputChange('annualGrowthRate', e.target.value)}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={params.income.annualGrowthRate}
                    onChange={(e) => handleIncomeInputChange('annualGrowthRate', e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Horizon (Years)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={params.income.timeHorizonMonths / 12}
                    onChange={(e) => handleIncomeInputChange('timeHorizonMonths', parseInt(e.target.value) * 12)}
                    className="w-full"
                  />
                  <input
                    type="number"
                    value={params.income.timeHorizonMonths / 12}
                    onChange={(e) => handleIncomeInputChange('timeHorizonMonths', parseInt(e.target.value) * 12)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Final Net Possession</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary && formatCurrency(summary.finalNetPossession)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loan Paid Off In</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary && summary.loanPaidOffMonth ? `${Math.floor(summary.loanPaidOffMonth / 12)} years ${summary.loanPaidOffMonth % 12} months` : 'Not paid off'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">First Positive Net Possession</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary && summary.firstPositiveMonth ? `${Math.floor(summary.firstPositiveMonth / 12)} years ${summary.firstPositiveMonth % 12} months` : 'Not achieved'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Interest Paid</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary && formatCurrency(summary.loanSummary?.totalInterest)}
                </p>
              </div>
            </div>

            {/* Net Possession Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Net Possession Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getGraphData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year"
                      domain={[0, Math.max(
                        Math.ceil(params.loan.loanTenureMonths / 12),
                        Math.ceil(params.income.timeHorizonMonths / 12),
                        Math.ceil(params.timeHorizonMonths / 12)
                      )]}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="loanBalance"
                      stroke="#ff4444"
                      name="Loan Balance"
                    />
                    <Line
                      type="monotone"
                      dataKey="incomeBalance"
                      stroke="#82ca9d"
                      name="Investment Balance"
                    />
                    <Line
                      type="monotone"
                      dataKey="netPossession"
                      stroke="#8884d8"
                      name="Net Possession"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 