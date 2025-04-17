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

interface IncomeParams {
  initialAmount: number;
  monthlyInvestment: number;
  annualInterestRate: number;
  timeHorizonYears: number;
  annualInflationRate: number;
  taxBracket: number;
}

export default function IncomeGrowth() {
  const [params, setParams] = useState<IncomeParams>({
    initialAmount: 100000,
    monthlyInvestment: 10000,
    annualInterestRate: 12,
    timeHorizonYears: 20,
    annualInflationRate: 6,
    taxBracket: 30,
  });

  const [isAdvanced, setIsAdvanced] = useState(false);

  const calculateIncomeGrowth = () => {
    const monthlyRate = params.annualInterestRate / 12 / 100;
    const months = params.timeHorizonYears * 12;
    const monthlyInflation = params.annualInflationRate / 12 / 100;

    let data = [];
    let currentAmount = params.initialAmount;
    let totalInvested = params.initialAmount;
    let inflationAdjustedAmount = params.initialAmount;

    for (let i = 0; i <= months; i++) {
      const yearFraction = i / 12;
      const interest = currentAmount * monthlyRate;
      const taxOnInterest = interest * (params.taxBracket / 100);
      const netInterest = interest - taxOnInterest;

      currentAmount += netInterest + params.monthlyInvestment;
      totalInvested += params.monthlyInvestment;
      
      // Calculate inflation-adjusted values
      const inflationFactor = Math.pow(1 + monthlyInflation, i);
      inflationAdjustedAmount = currentAmount / inflationFactor;

      if (i % 12 === 0) {
        data.push({
          year: yearFraction,
          totalValue: currentAmount,
          totalInvested,
          inflationAdjustedValue: inflationAdjustedAmount,
          yearlyInterest: interest * 12,
          yearlyTax: taxOnInterest * 12,
          monthlyIncome: (currentAmount * monthlyRate), // Monthly passive income
          inflationAdjustedIncome: (currentAmount * monthlyRate) / inflationFactor, // Inflation-adjusted monthly income
        });
      }
    }
    return data;
  };

  const data = calculateIncomeGrowth();
  const finalValues = data[data.length - 1];

  const getAlternativeInvestments = () => {
    const alternatives = [
      { name: 'FD (5.5%)', rate: 5.5 },
      { name: 'PPF (7.1%)', rate: 7.1 },
      { name: 'NPS (10%)', rate: 10 },
      { name: 'Current Plan', rate: params.annualInterestRate },
    ];

    return alternatives.map(alt => {
      const monthlyRate = alt.rate / 12 / 100;
      const months = params.timeHorizonYears * 12;
      let amount = params.initialAmount;

      for (let i = 0; i < months; i++) {
        amount += params.monthlyInvestment + (amount * monthlyRate);
      }

      return {
        name: alt.name,
        value: amount,
        monthlyIncome: amount * monthlyRate,
      };
    });
  };

  const getMilestones = () => {
    const targetAmounts = [1000000, 5000000, 10000000, 50000000]; // 10L, 50L, 1Cr, 5Cr
    const milestones = [];

    for (const target of targetAmounts) {
      const yearData = data.find(d => d.totalValue >= target);
      if (yearData) {
        milestones.push({
          target: formatCurrency(target),
          years: yearData.year.toFixed(1),
          monthlyIncome: formatCurrency(target * (params.annualInterestRate / 12 / 100)),
          monthlyRequired: formatCurrency(params.monthlyInvestment),
        });
      }
    }
    return milestones;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Income Growth Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Plan your path to financial independence with passive income analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Investment Parameters</h2>
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
                  onChange={(e) => setParams(prev => ({ ...prev, initialAmount: Number(e.target.value) }))}
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
                    onChange={(e) => setParams(prev => ({ ...prev, initialAmount: Number(e.target.value) }))}
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
                  Monthly Investment
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={params.monthlyInvestment}
                  onChange={(e) => setParams(prev => ({ ...prev, monthlyInvestment: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>₹1,000</span>
                  <span>₹1L</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    value={params.monthlyInvestment}
                    onChange={(e) => setParams(prev => ({ ...prev, monthlyInvestment: Number(e.target.value) }))}
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
                  Expected Annual Return Rate
                </label>
                <input
                  type="range"
                  min="4"
                  max="15"
                  step="0.1"
                  value={params.annualInterestRate}
                  onChange={(e) => setParams(prev => ({ ...prev, annualInterestRate: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>4%</span>
                  <span>15%</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    value={params.annualInterestRate}
                    onChange={(e) => setParams(prev => ({ ...prev, annualInterestRate: Number(e.target.value) }))}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Time Horizon
                </label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={params.timeHorizonYears}
                  onChange={(e) => setParams(prev => ({ ...prev, timeHorizonYears: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>1 Year</span>
                  <span>40 Years</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    value={params.timeHorizonYears}
                    onChange={(e) => setParams(prev => ({ ...prev, timeHorizonYears: Number(e.target.value) }))}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">Years</span>
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Advanced Parameters</span>
                  <Switch
                    checked={isAdvanced}
                    onChange={setIsAdvanced}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isAdvanced ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isAdvanced ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </Switch>
                </div>

                {isAdvanced && (
                  <div className="space-y-6">
                    {/* Inflation Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Inflation Rate
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="0.1"
                        value={params.annualInflationRate}
                        onChange={(e) => setParams(prev => ({ ...prev, annualInflationRate: Number(e.target.value) }))}
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
                          onChange={(e) => setParams(prev => ({ ...prev, annualInflationRate: Number(e.target.value) }))}
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
                        Your Tax Bracket
                      </label>
                      <select
                        value={params.taxBracket}
                        onChange={(e) => setParams(prev => ({ ...prev, taxBracket: Number(e.target.value) }))}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Passive Income</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(finalValues?.monthlyIncome || 0)}
                </p>
                {isAdvanced && (
                  <p className="text-sm text-gray-500 mt-2">
                    Inflation-adjusted: {formatCurrency(finalValues?.inflationAdjustedIncome || 0)}
                  </p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Value</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(finalValues?.totalValue || 0)}
                </p>
                {isAdvanced && (
                  <p className="text-sm text-gray-500 mt-2">
                    Total Invested: {formatCurrency(finalValues?.totalInvested || 0)}
                  </p>
                )}
              </div>
            </div>

            {/* Basic Growth Chart */}
            {!isAdvanced && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Income Growth</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="monthlyIncome"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="Monthly Income"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Advanced Analysis */}
            {isAdvanced && (
              <>
                {/* Real vs Nominal Income */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Real vs Nominal Monthly Income</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)}
                          width={100}
                        />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="monthlyIncome"
                          stroke="#8884d8"
                          name="Nominal Income"
                        />
                        <Line
                          type="monotone"
                          dataKey="inflationAdjustedIncome"
                          stroke="#82ca9d"
                          name="Real Income (Inflation Adjusted)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>• Nominal Income: Your monthly passive income without considering inflation</p>
                    <p>• Real Income: Your actual purchasing power after inflation</p>
                    <p>• The gap shows how inflation affects your income over time</p>
                  </div>
                </div>

                {/* Income Comparison */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Compare Monthly Income from Different Investments</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getAlternativeInvestments()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)}
                          width={100}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="monthlyIncome" fill="#8884d8">
                          {getAlternativeInvestments().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>• Monthly income comparison across different investment options</p>
                    <p>• Shows potential passive income from each investment type</p>
                    <p>• Helps choose the best option for your income goals</p>
                  </div>
                </div>

                {/* Income Milestones */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Income Milestones</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Portfolio Size
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Years to Achieve
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Income
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getMilestones().map((milestone, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {milestone.target}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {milestone.years} years
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {milestone.monthlyIncome}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>• Shows potential monthly income at different portfolio sizes</p>
                    <p>• Helps plan for income replacement goals</p>
                    <p>• Track progress towards financial independence</p>
                  </div>
                </div>

                {/* Investment Tips */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Income Generation Tips</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Dividend Investing</h4>
                      <p>• Look for companies with consistent dividend history</p>
                      <p>• Consider dividend aristocrats for stable income</p>
                      <p>• Reinvest dividends during accumulation phase</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Income Diversification</h4>
                      <p>• Mix high-yield and growth investments</p>
                      <p>• Consider REITs for real estate income</p>
                      <p>• Explore bonds for stable income</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Tax-Efficient Income</h4>
                      <p>• Use tax-advantaged accounts</p>
                      <p>• Consider municipal bonds for tax-free income</p>
                      <p>• Plan withdrawals strategically</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Risk Management</h4>
                      <p>• Build an emergency fund first</p>
                      <p>• Don't chase yield at the expense of safety</p>
                      <p>• Keep some growth assets for inflation protection</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 