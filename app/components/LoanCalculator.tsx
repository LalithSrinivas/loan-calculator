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
  LoanParams,
  calculateEMI,
  generateAmortizationSchedule,
  calculateLoanSummary,
  AmortizationRow,
} from '../utils/loanCalculations';
import { formatCurrency } from '../utils/currencyFormatter';

export default function LoanCalculator() {
  const [loanParams, setLoanParams] = useState<LoanParams>({
    loanAmount: 3000000,
    annualInterestRate: 8.5,
    loanTenureMonths: 240,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly',
    extraPaymentStartMonth: 1,
  });

  const [enableExtraPayment, setEnableExtraPayment] = useState(false);
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [regularSchedule, setRegularSchedule] = useState<AmortizationRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [regularSummary, setRegularSummary] = useState<any>(null);

  useEffect(() => {
    const regularParams = { ...loanParams, extraPayment: 0 };
    const regularSchedule = generateAmortizationSchedule(regularParams);
    setRegularSchedule(regularSchedule);
    setRegularSummary(calculateLoanSummary(regularSchedule));

    const newSchedule = generateAmortizationSchedule({
      ...loanParams,
      extraPayment: enableExtraPayment ? loanParams.extraPayment : 0,
    });
    setSchedule(newSchedule);
    setSummary(calculateLoanSummary(newSchedule));
  }, [loanParams, enableExtraPayment]);

  const handleInputChange = (field: keyof LoanParams, value: number | string) => {
    setLoanParams(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(value as string) || 0 : value,
    }));
  };
  

  const getGraphData = () => {
    const yearlyData = schedule.filter((_, index) => index % 12 === 0).map(row => ({
      year: Math.floor(row.month / 12),
      principal: row.principal,
      interest: row.interest,
      balance: row.remainingBalance,
    }));
    return yearlyData;
  };

  const getComparisonGraphData = () => {
    const yearlyData = [];
    const maxMonths = Math.max(schedule.length, regularSchedule.length);
    
    for (let month = 0; month < maxMonths; month += 12) {
      const year = Math.floor(month / 12);
      const regularRow = regularSchedule[month];
      const extraRow = schedule[month];
      
      yearlyData.push({
        year,
        regularBalance: regularRow?.remainingBalance || 0,
        extraBalance: extraRow?.remainingBalance || 0,
        regularTotalPaid: regularRow ? regularSchedule.slice(0, month + 1).reduce((sum, row) => sum + row.totalPayment, 0) : 0,
        extraTotalPaid: extraRow ? schedule.slice(0, month + 1).reduce((sum, row) => sum + row.totalPayment, 0) : 0,
      });
    }
    
    return yearlyData;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Home Loan EMI Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate your loan EMI and see the impact of extra payments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Loan Parameters</h2>
            
            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount
                </label>
                <input
                  type="range"
                  min="100000"
                  max="50000000"
                  step="100000"
                  value={loanParams.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between items-center mt-2">
                  <input
                    type="number"
                    value={loanParams.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {formatCurrency(loanParams.loanAmount)}
                  </span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Interest Rate (%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="25"
                  step="0.1"
                  value={loanParams.annualInterestRate}
                  onChange={(e) => handleInputChange('annualInterestRate', e.target.value)}
                  className="w-full"
                />
                <input
                  type="number"
                  value={loanParams.annualInterestRate}
                  onChange={(e) => handleInputChange('annualInterestRate', e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Loan Tenure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Tenure (Years)
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={loanParams.loanTenureMonths / 12}
                  onChange={(e) => handleInputChange('loanTenureMonths', parseInt(e.target.value) * 12)}
                  className="w-full"
                />
                <input
                  type="number"
                  value={loanParams.loanTenureMonths / 12}
                  onChange={(e) => handleInputChange('loanTenureMonths', parseInt(e.target.value) * 12)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Extra Payment Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Extra Payments</h3>
                  <Switch
                    checked={enableExtraPayment}
                    onChange={setEnableExtraPayment}
                    className={`${
                      enableExtraPayment ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span className="sr-only">Enable extra payments</span>
                    <span
                      className={`${
                        enableExtraPayment ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </div>

                {enableExtraPayment && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Payment Amount
                      </label>
                      <input
                        type="number"
                        value={loanParams.extraPayment}
                        onChange={(e) => handleInputChange('extraPayment', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Frequency
                      </label>
                      <select
                        value={loanParams.extraPaymentFrequency}
                        onChange={(e) => handleInputChange('extraPaymentFrequency', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semiannually">Semi-Annually</option>
                        <option value="annually">Annually</option>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly EMI</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(calculateEMI(loanParams))}
                </p>
              </div>
              
              {summary && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Total Interest</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(summary.totalInterest)}
                  </p>
                  {enableExtraPayment && regularSummary && (
                    <p className="text-sm text-gray-600 mt-2">
                      Savings: {formatCurrency(regularSummary.totalInterest - summary.totalInterest)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Comparison Chart */}
            {enableExtraPayment && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Extra Payment Impact</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getComparisonGraphData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Month ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="regularBalance"
                        stroke="#8884d8"
                        name="Regular Payment Balance"
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="extraBalance"
                        stroke="#82ca9d"
                        name="With Extra Payment Balance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Payment Breakdown Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Breakdown</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getGraphData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="principal"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Principal"
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Interest"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Balance Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Balance Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getGraphData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#ff7300"
                      name="Remaining Balance"
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