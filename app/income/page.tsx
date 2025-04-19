'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { Switch } from '@headlessui/react';
import { formatCurrency } from '../utils/currencyFormatter';
import GraphToggle from '../components/GraphToggle';
import { calculateIncomeGrowth, type IncomeGrowthParams, type MonthlyIncomeData } from '../utils/incomeCalculations';
import FinancialTooltip from '../components/FinancialTooltip';
import { saveTabState, loadTabState, IncomeGrowthCachedTabState } from '../utils/cacheUtils';

export default function IncomeGrowth() {
  const [params, setParams] = useState<IncomeGrowthParams>({
    initialAmount: 100000,
    monthlyContribution: 10000,
    contributionFrequency: 'monthly',
    annualGrowthRate: 12,
    timeHorizonMonths: 120,
    annualInflationRate: 6,
    taxBracket: 30
  });

  // Load cached values after initial render
  useEffect(() => {
    const cachedState = loadTabState<IncomeGrowthCachedTabState>('income_growth');
    if (cachedState) {
      setParams(cachedState);
    }
  }, []);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [incomeData, setIncomeData] = useState<MonthlyIncomeData[]>([]);

  useEffect(() => {
    const data = calculateIncomeGrowth(params);
    setIncomeData(data);
  }, [params]);

  const getInvestmentVsLoanComparison = () => {
    const monthlyRate = params.annualGrowthRate / 12 / 100;
    const loanRate = 9 / 12 / 100; // Assuming 9% loan interest rate
    const months = params.timeHorizonMonths;
    
    let investmentAmount = params.initialAmount;
    let loanBalance = params.initialAmount;
    let totalInvestmentContributions = params.initialAmount;
    let totalLoanPayments = 0;
    
    const comparisonData = [];
    
    for (let year = 0; year <= months/12; year++) {
      // Investment scenario
      for (let m = 0; m < 12 && year * 12 + m < months; m++) {
        investmentAmount = investmentAmount * (1 + monthlyRate) + params.monthlyContribution;
        totalInvestmentContributions += params.monthlyContribution;
      }

      // Loan prepayment scenario
      for (let m = 0; m < 12 && year * 12 + m < months; m++) {
        const loanInterest = loanBalance * loanRate;
        const principalReduction = params.monthlyContribution;
        loanBalance = Math.max(0, loanBalance - principalReduction);
        totalLoanPayments += principalReduction;
        
        if (loanBalance === 0) break;
      }

      const yearData = {
        year,
        investmentValue: investmentAmount,
        loanBalance,
        totalInvestmentContributions,
        totalLoanPayments,
        investmentReturns: investmentAmount - totalInvestmentContributions,
        interestSaved: params.initialAmount * Math.pow(1 + loanRate, year * 12) - loanBalance,
        netWorthInvestment: investmentAmount - params.initialAmount,
        netWorthPrepayment: params.initialAmount - loanBalance,
        monthlyIncomeFromInvestment: investmentAmount * monthlyRate,
        monthlyInterestSaved: loanBalance * loanRate
      };

      comparisonData.push(yearData);
    }

    return comparisonData;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleInputChange = (field: keyof IncomeGrowthParams, value: number | string) => {
    const newValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    setParams(prev => {
      const newParams = {
        ...prev,
        [field]: newValue,
      };
      saveTabState('income_growth', newParams);
      return newParams;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <FinancialTooltip
              term="Income Growth Calculator"
              explanation="A tool to help you understand how your investments can grow and generate regular income over time"
            />
          </h1>
          <p className="text-lg text-gray-600">
            Plan your path to financial independence with passive income analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">
              <FinancialTooltip
                term="Investment Parameters"
                explanation="Basic information about your investment plan, including how much you start with and how much you add regularly"
              />
            </h2>
            <div className="space-y-6">
              {/* Initial Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FinancialTooltip
                    term="Initial Amount"
                    explanation="The money you start investing with"
                  />
                </label>
                <input
                  type="range"
                  min="1"
                  max="100000000"
                  step="10000"
                  value={params.initialAmount}
                  onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>₹1</span>
                  <span>₹10Cr</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    min="1"
                    max="100000000"
                    value={params.initialAmount}
                    onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                </div>
              </div>

              {/* Monthly Investment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FinancialTooltip
                    term="Monthly Investment"
                    explanation="The amount you plan to add to your investment every month"
                  />
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000000"
                  step="1000"
                  value={params.monthlyContribution}
                  onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>₹1</span>
                  <span>₹10L</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    value={params.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                </div>
              </div>

              {/* Annual Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FinancialTooltip
                    term="Expected Annual Return Rate"
                    explanation="The average percentage your investment is expected to grow each year"
                  />
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="20"
                  step="0.1"
                  value={params.annualGrowthRate}
                  onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>0.01%</span>
                  <span>20%</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    min="0.01"
                    max="20"
                    step="0.1"
                    value={params.annualGrowthRate}
                    onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FinancialTooltip
                    term="Investment Time Horizon"
                    explanation="How many years you plan to keep your money invested"
                  />
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={params.timeHorizonMonths / 12}
                  onChange={(e) => handleInputChange('timeHorizonMonths', Number(e.target.value) * 12)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={params.timeHorizonMonths / 12}
                    onChange={(e) => handleInputChange('timeHorizonMonths', Number(e.target.value) * 12)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    <FinancialTooltip
                      term="Advanced Parameters"
                      explanation="Additional factors that affect your investment growth, like inflation and taxes"
                    />
                  </span>
                  <Switch
                    checked={showAdvanced}
                    onChange={setShowAdvanced}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      showAdvanced ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showAdvanced ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </Switch>
                </div>

                {showAdvanced && (
                  <div className="space-y-6">
                    {/* Inflation Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FinancialTooltip
                          term="Expected Inflation Rate"
                          explanation="How much prices are expected to rise each year, reducing your money's buying power"
                        />
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="0.1"
                        value={params.annualInflationRate}
                        onChange={(e) => handleInputChange('annualInflationRate', Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                        <span>2%</span>
                        <span>10%</span>
                      </div>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={params.annualInflationRate}
                          onChange={(e) => handleInputChange('annualInflationRate', Number(e.target.value))}
                          className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax Bracket */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FinancialTooltip
                          term="Your Tax Bracket"
                          explanation="The percentage of your investment income that goes to taxes"
                        />
                      </label>
                      <select
                        value={params.taxBracket}
                        onChange={(e) => handleInputChange('taxBracket', Number(e.target.value))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value={0}>No Tax (0%)</option>
                        <option value={5}>5% Bracket</option>
                        <option value={20}>20% Bracket</option>
                        <option value={30}>30% Bracket</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <FinancialTooltip
                    term="Monthly Passive Income"
                    explanation="The regular income you can expect from your investments each month"
                  />
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(incomeData[incomeData.length - 1]?.monthlyIncome || 0)}
                </p>
                {showAdvanced && (
                  <p className="text-sm text-gray-500 mt-2">
                    After Tax: {formatCurrency((incomeData[incomeData.length - 1]?.monthlyIncome || 0) * (1 - (params.taxBracket || 0) / 100))}
                  </p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <FinancialTooltip
                    term="Portfolio Value"
                    explanation="The total worth of all your investments combined"
                  />
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(incomeData[incomeData.length - 1]?.totalValue || 0)}
                </p>
                {showAdvanced && (
                  <p className="text-sm text-gray-500 mt-2">
                    Total Invested: {formatCurrency(incomeData[incomeData.length - 1]?.totalContributions || 0)}
                  </p>
                )}
              </div>
            </div>

            {/* Investment vs Loan Prepayment Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <FinancialTooltip
                  term="Investment vs Loan Prepayment"
                  explanation="Compare the financial impact of investing versus using the same money to prepay your loan"
                />
              </h3>
              <div className="space-y-6">
                {/* Total Value Comparison */}
                <div className="h-80">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Net Worth Growth Comparison</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getInvestmentVsLoanComparison()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Years', position: 'bottom' }} />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={100} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="netWorthInvestment"
                        name="Net Worth (Investment)"
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey="netWorthPrepayment"
                        name="Net Worth (Prepayment)"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Benefit Comparison */}
                <div className="h-80">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Benefit Comparison</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={getInvestmentVsLoanComparison()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Years', position: 'bottom' }} />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={100} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar
                        dataKey="monthlyIncomeFromInvestment"
                        name="Monthly Investment Income"
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="monthlyInterestSaved"
                        name="Monthly Interest Saved"
                        fill="#82ca9d"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Investment Strategy</h4>
                    {(() => {
                      const finalData = getInvestmentVsLoanComparison().slice(-1)[0];
                      return (
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li>• Final Portfolio Value: {formatCurrency(finalData.investmentValue)}</li>
                          <li>• Total Invested: {formatCurrency(finalData.totalInvestmentContributions)}</li>
                          <li>• Investment Returns: {formatCurrency(finalData.investmentReturns)}</li>
                          <li>• Monthly Income: {formatCurrency(finalData.monthlyIncomeFromInvestment)}</li>
                        </ul>
                      );
                    })()}
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Loan Prepayment</h4>
                    {(() => {
                      const finalData = getInvestmentVsLoanComparison().slice(-1)[0];
                      return (
                        <ul className="space-y-2 text-sm text-green-800">
                          <li>• Remaining Loan: {formatCurrency(finalData.loanBalance)}</li>
                          <li>• Total Prepaid: {formatCurrency(finalData.totalLoanPayments)}</li>
                          <li>• Interest Saved: {formatCurrency(finalData.interestSaved)}</li>
                          <li>• Years to Debt-Free: {getInvestmentVsLoanComparison().findIndex(d => d.loanBalance === 0) / 12 || 'N/A'}</li>
                        </ul>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Investment strategy assumes {params.annualGrowthRate}% annual returns</p>
                  <p>• Loan calculations assume 9% annual interest rate</p>
                  <p>• Net worth considers loan balance as negative and investments as positive</p>
                  <p>• All calculations ignore tax implications for simplicity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 