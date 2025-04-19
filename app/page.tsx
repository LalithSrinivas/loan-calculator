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
} from 'recharts';
import { Switch } from '@headlessui/react';
import {
  LoanParams,
  calculateEMI,
  generateAmortizationSchedule,
  calculateLoanSummary,
  getExtraPaymentImpact
} from './utils/loanCalculations';
import { formatCurrency } from './utils/currencyFormatter';
import GraphToggle from './components/GraphToggle';
import { saveTabState, loadTabState, LoanCachedTabState } from './utils/cacheUtils';

export default function LoanCalculator() {
  const [params, setParams] = useState<LoanParams>({
    loanAmount: 1000000,
    annualInterestRate: 8.5,
    loanTenureMonths: 240,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly' as const,
    extraPaymentStartMonth: 1,
  });

  // Load cached values after initial render
  useEffect(() => {
    const cachedState = loadTabState<LoanCachedTabState>('basic_loan');
    if (cachedState) {
      setParams(cachedState);
    }
  }, []);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [showExtraPayment, setShowExtraPayment] = useState(false);

  useEffect(() => {
    const newSchedule = generateAmortizationSchedule(params);
    setSchedule(newSchedule);
    setSummary(calculateLoanSummary(newSchedule));
  }, [params]);

  const handleInputChange = (field: keyof LoanParams, value: number | string) => {
    const newValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    setParams(prev => {
      const newParams = {
        ...prev,
        [field]: newValue,
      };
      // Save state to cache whenever it changes
      saveTabState('basic_loan', newParams);
      return newParams;
    });
  };

  const getGraphData = () => {
    return schedule.filter((_, index) => index % 12 === 0).map(row => ({
      year: Math.floor(row.month / 12),
      principal: row.principal,
      interest: row.interest,
      remainingBalance: row.remainingBalance,
    }));
  };

  // Add comparison data for with and without extra payments
  const getComparisonData = () => {
    const withoutExtra = generateAmortizationSchedule({
      ...params,
      extraPayment: 0
    });
    const withExtra = schedule;

    return withoutExtra.filter((_, index) => index % 12 === 0).map((row, i) => ({
      year: Math.floor(row.month / 12),
      withoutExtra: row.remainingBalance,
      withExtra: withExtra[i * 12]?.remainingBalance || 0,
    }));
  };

  // Advanced graph data preparation functions
  const getPaymentBreakdown = () => {
    if (!summary) return [];
    return [
      { name: 'Principal', value: params.loanAmount },
      { name: 'Total Interest', value: summary.totalInterest }
    ];
  };

  const getTenureImpact = () => {
    const frequencies: ('monthly' | 'quarterly' | 'semiannually' | 'annually')[] = 
      ['monthly', 'quarterly', 'semiannually', 'annually'];
    return frequencies.map(freq => {
      const adjustedParams = { ...params, extraPaymentFrequency: freq };
      const adjustedSchedule = generateAmortizationSchedule(adjustedParams);
      const adjustedSummary = calculateLoanSummary(adjustedSchedule);
      return {
        frequency: freq.charAt(0).toUpperCase() + freq.slice(1),
        months: adjustedSchedule.length,
        interestSaved: summary ? summary.totalInterest - adjustedSummary.totalInterest : 0
      };
    });
  };

  const getRateSensitivity = () => {
    const rates = [params.annualInterestRate - 0.5, params.annualInterestRate, params.annualInterestRate + 0.5];
    return rates.map(rate => {
      const adjustedParams = { ...params, annualInterestRate: rate };
      return {
        rate: `${rate}%`,
        emi: calculateEMI(adjustedParams)
      };
    });
  };

  const COLORS = ['#0088FE', '#FF8042'];

  // Add handler for extra payment toggle
  const handleExtraPaymentToggle = (enabled: boolean) => {
    setShowExtraPayment(enabled);
    if (!enabled) {
      setParams(prev => ({
        ...prev,
        extraPayment: 0
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Loan Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate your loan EMI and visualize payment breakdown
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Loan Parameters</h2>
            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount
                </label>
                <input
                  type="range"
                  min="1"
                  max="100000000"
                  step="100000"
                  value={params.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
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
                    value={params.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label htmlFor="annualInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Interest Rate
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="20"
                  step="0.1"
                  value={params.annualInterestRate}
                  onChange={(e) => handleInputChange('annualInterestRate', e.target.value)}
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
                    value={params.annualInterestRate}
                    onChange={(e) => handleInputChange('annualInterestRate', e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Loan Tenure */}
              <div>
                <label htmlFor="loanTenureMonths" className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Tenure (Months)
                </label>
                <input
                  type="range"
                  min="12"
                  max="360"
                  step="12"
                  value={params.loanTenureMonths}
                  onChange={(e) => handleInputChange('loanTenureMonths', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    min="12"
                    max="360"
                    value={params.loanTenureMonths}
                    onChange={(e) => handleInputChange('loanTenureMonths', e.target.value)}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Extra Payment Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Enable Extra Payments</span>
                <Switch
                  checked={showExtraPayment}
                  onChange={handleExtraPaymentToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    showExtraPayment ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showExtraPayment ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>

              {/* Extra Payment Fields */}
              {showExtraPayment && (
                <div className="space-y-6 pt-4 border-t border-gray-200">
                  {/* Extra Payment */}
                  <div>
                    <label htmlFor="extraPayment" className="block text-sm font-medium text-gray-700 mb-1">
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
                  </div>

                  {/* Extra Payment Frequency */}
                  <div>
                    <label htmlFor="extraPaymentFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                      Extra Payment Frequency
                    </label>
                    <select
                      value={params.extraPaymentFrequency}
                      onChange={(e) => handleInputChange('extraPaymentFrequency', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semiannually">Semi-annually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  {/* Extra Payment Start Month */}
                  <div>
                    <label htmlFor="extraPaymentStartMonth" className="block text-sm font-medium text-gray-700 mb-1">
                      Extra Payment Start Month
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={params.extraPaymentStartMonth}
                      onChange={(e) => handleInputChange('extraPaymentStartMonth', e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                      <span>Month 1</span>
                      <span>Month 120</span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={params.extraPaymentStartMonth}
                        onChange={(e) => handleInputChange('extraPaymentStartMonth', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly EMI</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary ? formatCurrency(summary.monthlyEMI) : '₹0'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Interest</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary ? formatCurrency(summary.totalInterest) : '₹0'}
                </p>
                {
                  showExtraPayment && (
                    <p className="text-sm text-gray-600">
                      Interest saved with extra payments: {summary ? formatCurrency(getExtraPaymentImpact(params).interestSaved) : '₹0'}
                    </p>
                  )
                }
              </div>
            </div>

            {/* Graph Toggle */}
            <GraphToggle isAdvanced={isAdvanced} onToggle={setIsAdvanced} />

            {/* Basic Graphs */}
            {!isAdvanced && (
              <>
                {/* Amortization Chart */}
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
                          dataKey="principal"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name="Principal"
                        />
                        <Area
                          type="monotone"
                          dataKey="interest"
                          stackId="1"
                          stroke="#ffc658"
                          fill="#ffc658"
                          name="Interest"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Remaining Balance Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Remaining Balance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={showExtraPayment ? getComparisonData() : getGraphData()}
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
                        {showExtraPayment ? (
                          <>
                            <Line
                              type="monotone"
                              dataKey="withoutExtra"
                              stroke="#8884d8"
                              name="Without Extra Payment"
                            />
                            <Line
                              type="monotone"
                              dataKey="withExtra"
                              stroke="#82ca9d"
                              name="With Extra Payment"
                            />
                          </>
                        ) : (
                          <Line
                            type="monotone"
                            dataKey="remainingBalance"
                            stroke="#8884d8"
                            name="Balance"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Advanced Graphs */}
            {isAdvanced && (
              <>
                {/* Payment Breakdown Pie Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Total Payment Breakdown</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPaymentBreakdown()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {getPaymentBreakdown().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Extra Payment Impact Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Extra Payment Impact</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getTenureImpact()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="frequency" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip 
                          formatter={(value: number, name: string) => 
                            name === 'months' ? `${value} months` : formatCurrency(value)
                          }
                        />
                        <Bar yAxisId="left" dataKey="months" fill="#8884d8" name="Loan Tenure" />
                        <Bar yAxisId="right" dataKey="interestSaved" fill="#82ca9d" name="Interest Saved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rate Sensitivity Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Sensitivity</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getRateSensitivity()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rate" />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(value)}
                          width={100}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="emi" fill="#8884d8" name="Monthly EMI" />
                      </BarChart>
                    </ResponsiveContainer>
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