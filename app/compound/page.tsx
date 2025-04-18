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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateLoanSchedule, formatIndianCurrency } from '../utils/loanCalculations';
import { calculateIncomeGrowth } from '../utils/incomeCalculations';
import AdvancedAnalysis from '../components/AdvancedAnalysis';
import { Switch } from '@headlessui/react';
import { calculateEMI } from '../utils/loanCalculations';

interface CompoundScenarioParams {
  // Loan Parameters
  loanAmount: number;
  loanInterestRate: number;
  loanTenureMonths: number;
  extraPayment: number;
  extraPaymentFrequency: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  extraPaymentStartMonth: number;
  // Income Parameters
  initialAmount: number;
  monthlyContribution: number;
  contributionFrequency: 'monthly' | 'annually';
  annualGrowthRate: number;
  
  // Common Parameters
  timeHorizonMonths: number;
}

export default function CompoundScenario() {
  const [params, setParams] = useState<CompoundScenarioParams>({
    // Loan defaults
    loanAmount: 2000000,
    loanInterestRate: 8.5,
    loanTenureMonths: 180,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly' as const,
    extraPaymentStartMonth: 0,
    
    // Income defaults
    initialAmount: 500000,
    monthlyContribution: 10000,
    contributionFrequency: 'monthly',
    annualGrowthRate: 12,
    
    // Time horizon defaults to loan tenure
    timeHorizonMonths: 180
  });

  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    loanPaidOffMonth: 0,
    netPositiveMonth: 0,
    finalNetPossession: 0,
    finalLoanBalance: 0,
    finalIncomeBalance: 0
  });

  const [isAdvanced, setIsAdvanced] = useState(false);

  const handleInputChange = (field: keyof CompoundScenarioParams, value: number | string) => {
    setParams(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(value as string) || 0 : value,
    }));
  };

  useEffect(() => {
    // Calculate loan schedule
    const loanSchedule = calculateLoanSchedule({
      principal: params.loanAmount,
      annualRate: params.loanInterestRate,
      tenureMonths: params.loanTenureMonths,
      extraPayment: params.extraPayment,
      extraPaymentFrequency: params.extraPaymentFrequency
    });

    // Calculate income growth
    const incomeGrowth = calculateIncomeGrowth({
      initialAmount: params.initialAmount,
      monthlyContribution: params.monthlyContribution,
      contributionFrequency: params.contributionFrequency,
      annualGrowthRate: params.annualGrowthRate,
      timeHorizonMonths: params.timeHorizonMonths
    });

    // Combine the data
    const combined = Array.from({ length: params.timeHorizonMonths + 1 }, (_, month) => {
      const loanData = loanSchedule[Math.min(month, loanSchedule.length - 1)];
      const incomeData = incomeGrowth[month];
      
      const loanBalance = month >= loanSchedule.length ? 0 : loanData.remainingBalance;
      const incomeBalance = incomeData.totalValue;
      const netPossession = incomeBalance - loanBalance;
      const monthlyIncome = params.monthlyContribution * Math.pow(1 + params.annualGrowthRate/1200, month);

      return {
        month,
        loanBalance,
        incomeBalance,
        netPossession,
        'Monthly Income': monthlyIncome
      };
    });

    setCombinedData(combined);

    // Calculate summary metrics
    const loanPaidOffMonth = loanSchedule.findIndex(month => month.remainingBalance <= 0);
    const netPositiveMonth = combined.findIndex(month => month.netPossession > 0);
    const finalData = combined[combined.length - 1];

    setSummary({
      loanPaidOffMonth: loanPaidOffMonth >= 0 ? loanPaidOffMonth : params.loanTenureMonths,
      netPositiveMonth: netPositiveMonth >= 0 ? netPositiveMonth : -1,
      finalNetPossession: finalData.netPossession,
      finalLoanBalance: finalData.loanBalance,
      finalIncomeBalance: finalData.incomeBalance
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Net Possession Scenario
          </h1>
          <p className="text-lg text-gray-600">
            Analyze your financial journey combining loan repayment and wealth growth
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-8">
              {/* Loan Parameters */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Loan Parameters</h2>
                <div className="space-y-6">
                  {/* Loan Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="10000000"
                      step="100000"
                      value={params.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>₹1L</span>
                      <span>₹1Cr</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.loanAmount}
                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Interest Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Interest Rate (%)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="0.1"
                      value={params.loanInterestRate}
                      onChange={(e) => handleInputChange('loanInterestRate', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>5%</span>
                      <span>15%</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.loanInterestRate}
                        onChange={(e) => handleInputChange('loanInterestRate', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        step="0.1"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Tenure */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Tenure (Months)
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="360"
                      step="12"
                      value={params.loanTenureMonths}
                      onChange={(e) => {
                        handleInputChange('loanTenureMonths', e.target.value); 
                        if (params.timeHorizonMonths < parseFloat(e.target.value)) {
                          handleInputChange('timeHorizonMonths', parseFloat(e.target.value))
                        }
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>1 Year</span>
                      <span>30 Years</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.loanTenureMonths}
                        onChange={(e) => handleInputChange('loanTenureMonths', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">Months</span>
                      </div>
                    </div>
                  </div>

                  {/* Extra Payment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extra Payment
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={params.extraPayment}
                      onChange={(e) => handleInputChange('extraPayment', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>₹0</span>
                      <span>₹1L</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.extraPayment}
                        onChange={(e) => handleInputChange('extraPayment', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                    </div>
                    <select
                      value={params.extraPaymentFrequency}
                      onChange={(e) => handleInputChange('extraPaymentFrequency', e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semiannually">Semi-annually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Income Parameters */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Income Source Parameters</h2>
                <div className="space-y-6">
                  {/* Initial Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Amount
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={params.initialAmount}
                      onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>₹0</span>
                      <span>₹10L</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.initialAmount}
                        onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Contribution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contribution Amount
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="100000"
                      step="1000"
                      value={params.monthlyContribution}
                      onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>₹1,000</span>
                      <span>₹1L</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.monthlyContribution}
                        onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                    </div>
                    <select
                      value={params.contributionFrequency}
                      onChange={(e) => handleInputChange('contributionFrequency', e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  {/* Growth Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Growth Rate (%)
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="15"
                      step="0.1"
                      value={params.annualGrowthRate}
                      onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>4%</span>
                      <span>15%</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.annualGrowthRate}
                        onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        step="0.1"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Horizon */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Analysis Time Horizon</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Horizon (Months)
                  </label>
                  <input
                    type="range"
                    min={params.loanTenureMonths}
                    max="360"
                    step="12"
                    value={params.timeHorizonMonths}
                    onChange={(e) => handleInputChange('timeHorizonMonths', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                    <span>{Math.floor(params.loanTenureMonths/12)} Years</span>
                    <span>30 Years</span>
                  </div>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      value={params.timeHorizonMonths}
                      onChange={(e) => handleInputChange('timeHorizonMonths', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">Months</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Final Net Possession</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(summary.finalNetPossession)}
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>Loan Balance: {formatCurrency(summary.finalLoanBalance)}</p>
                    <p>Income Balance: {formatCurrency(summary.finalIncomeBalance)}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Key Milestones</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Loan Paid Off: </span>
                      <span className="font-medium">
                        {Math.floor(summary.loanPaidOffMonth / 12)} years {summary.loanPaidOffMonth % 12} months
                      </span>
                    </p>
                    {summary.netPositiveMonth >= 0 && (
                      <p>
                        <span className="text-gray-600">Net Positive After: </span>
                        <span className="font-medium">
                          {Math.floor(summary.netPositiveMonth / 12)} years {summary.netPositiveMonth % 12} months
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Net Possession Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Net Possession Over Time</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={combinedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month"
                        tickFormatter={(month) => `${month}`}
                        domain={[0, Math.ceil(params.timeHorizonMonths)]}
                        type="number"
                        allowDataOverflow={false}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${formatIndianCurrency(value)}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(month) => `Month ${month}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="loanBalance"
                        stroke="#ef4444"
                        name="Loan Balance"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="incomeBalance"
                        stroke="#22c55e"
                        name="Income Balance"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="netPossession"
                        stroke="#3b82f6"
                        name="Net Possession"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>• Red line shows your remaining loan balance</p>
                  <p>• Green line shows your income source growth</p>
                  <p>• Blue line shows your net possession (Income - Loan)</p>
                </div>
              </div>

              {/* Monthly Income Growth Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Income Growth</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month"
                        tickFormatter={(month) => `${month}`}
                        domain={[0, Math.ceil(params.timeHorizonMonths)]}
                        type="number"
                        allowDataOverflow={false}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(month) => `Month ${month}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="Monthly Income"
                        stroke="#818cf8"
                        fill="#818cf8"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analysis Tips */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Insights</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Net Possession Strategy</h4>
                    <p>• Balance between aggressive loan repayment and investment growth</p>
                    <p>• Consider the interest rate differential between loan and investments</p>
                    <p>• Extra loan payments reduce interest but may slow wealth building</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Optimization Tips</h4>
                    <p>• Higher investment returns can justify maintaining the loan longer</p>
                    <p>• Regular contributions to investments help offset loan burden</p>
                    <p>• Consider tax implications of investment gains vs loan interest</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Risk Considerations</h4>
                    <p>• Investment returns are not guaranteed while loan payments are</p>
                    <p>• Market volatility can affect the net possession trajectory</p>
                    <p>• Maintain emergency fund separate from investment portfolio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Analysis Toggle */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Advanced Analysis</h2>
              <p className="text-gray-600">Dive deep into your financial metrics and optimization opportunities</p>
            </div>
            <Switch
              checked={isAdvanced}
              onChange={setIsAdvanced}
              className={`${
                isAdvanced ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  isAdvanced ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          {/* Advanced Analysis Section */}
          {isAdvanced && (
            <AdvancedAnalysis
              loanAmount={params.loanAmount}
              loanInterestRate={params.loanInterestRate}
              loanTenureMonths={params.loanTenureMonths}
              monthlyEMI={calculateEMI({
                loanAmount: params.loanAmount,
                annualInterestRate: params.loanInterestRate,
                loanTenureMonths: params.loanTenureMonths,
                extraPayment: params.extraPayment,
                extraPaymentFrequency: params.extraPaymentFrequency,
                extraPaymentStartMonth: params.extraPaymentStartMonth
              })}
              initialAmount={params.initialAmount}
              monthlyInvestment={params.monthlyContribution}
              expectedReturn={params.annualGrowthRate}
            />
          )}
        </div>
      </div>
    </div>
  );
} 