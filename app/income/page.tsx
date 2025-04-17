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
  LineChart,
  Line
} from 'recharts';
import { Switch } from '@headlessui/react';
import {
  IncomeParams,
  calculateFutureValue,
  calculateIncomeSummary,
} from '../utils/incomeCalculations';
import { formatCurrency } from '../utils/currencyFormatter';

export default function IncomeGrowth() {
  const [params, setParams] = useState<IncomeParams>({
    initialAmount: 100000,
    periodicContribution: 10000,
    contributionFrequency: 'monthly',
    annualGrowthRate: 8,
    timeHorizonMonths: 240,
  });

  const [schedule, setSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const newSchedule = calculateFutureValue(params);
    setSchedule(newSchedule);
    setSummary(calculateIncomeSummary(newSchedule));
  }, [params]);

  const handleInputChange = (field: keyof IncomeParams, value: number | string) => {
    setParams(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const getGraphData = () => {
    return schedule.filter((_, index) => index % 12 === 0).map(row => ({
      year: Math.floor(row.month / 12),
      balance: row.endingBalance,
      contributions: row.contribution,
      growth: row.growth,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Income Growth Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate potential growth of your investments over time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Investment Parameters</h2>
            <div className="space-y-6">
              {/* Initial Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Amount
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="10000"
                  value={params.initialAmount}
                  onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between items-center mt-2">
                  <input
                    type="number"
                    value={params.initialAmount}
                    onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                    className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {formatCurrency(params.initialAmount)}
                  </span>
                </div>
              </div>

              {/* Periodic Contribution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periodic Contribution
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={params.periodicContribution}
                  onChange={(e) => handleInputChange('periodicContribution', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between items-center mt-2">
                  <input
                    type="number"
                    value={params.periodicContribution}
                    onChange={(e) => handleInputChange('periodicContribution', e.target.value)}
                    className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {formatCurrency(params.periodicContribution)}
                  </span>
                </div>
              </div>

              {/* Contribution Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Frequency
                </label>
                <select
                  value={params.contributionFrequency}
                  onChange={(e) => handleInputChange('contributionFrequency', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                  <option value="one-time">One-Time</option>
                </select>
              </div>

              {/* Growth Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Growth Rate (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={params.annualGrowthRate}
                  onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
                  className="w-full"
                />
                <input
                  type="number"
                  value={params.annualGrowthRate}
                  onChange={(e) => handleInputChange('annualGrowthRate', e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Time Horizon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Horizon (Years)
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={params.timeHorizonMonths / 12}
                  onChange={(e) => handleInputChange('timeHorizonMonths', parseInt(e.target.value) * 12)}
                  className="w-full"
                />
                <input
                  type="number"
                  value={params.timeHorizonMonths / 12}
                  onChange={(e) => handleInputChange('timeHorizonMonths', parseInt(e.target.value) * 12)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Final Balance</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary && formatCurrency(summary.finalBalance)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Growth</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary && formatCurrency(summary.totalGrowth)}
                </p>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getGraphData()}
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
                      dataKey="balance"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Total Balance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contributions vs Growth Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contributions vs Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getGraphData()}
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
                      dataKey="contributions"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Contributions"
                    />
                    <Area
                      type="monotone"
                      dataKey="growth"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="Growth"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 