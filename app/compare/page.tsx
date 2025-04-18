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
import {
  LoanParams,
  calculateEMI,
  generateAmortizationSchedule,
  calculateLoanSummary,
} from '../utils/loanCalculations';
import { formatCurrency } from '../utils/currencyFormatter';
import GraphToggle from '../components/GraphToggle';
import { saveTabState, loadTabState, LoanCachedTabState } from '../utils/cacheUtils';

export default function LoanComparison() {
  const [scenario1, setScenario1] = useState<LoanParams>({
    loanAmount: 1000000,
    annualInterestRate: 8.5,
    loanTenureMonths: 240,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly' as const,
    extraPaymentStartMonth: 1,
  });

  const [scenario2, setScenario2] = useState<LoanParams>({
    loanAmount: 1000000,
    annualInterestRate: 7.5,
    loanTenureMonths: 240,
    extraPayment: 5000,
    extraPaymentFrequency: 'monthly' as const,
    extraPaymentStartMonth: 1,
  });

  // Load cached values after initial render
  useEffect(() => {
    const cachedState1 = loadTabState<LoanCachedTabState>('comparison_scenario1');
    const cachedState2 = loadTabState<LoanCachedTabState>('comparison_scenario2');
    
    if (cachedState1) {
      setScenario1(cachedState1);
    }
    if (cachedState2) {
      setScenario2(cachedState2);
    }
  }, []);

  const [schedule1, setSchedule1] = useState<any[]>([]);
  const [schedule2, setSchedule2] = useState<any[]>([]);
  const [summary1, setSummary1] = useState<any>(null);
  const [summary2, setSummary2] = useState<any>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);

  useEffect(() => {
    const newSchedule1 = generateAmortizationSchedule(scenario1);
    const newSchedule2 = generateAmortizationSchedule(scenario2);
    setSchedule1(newSchedule1);
    setSchedule2(newSchedule2);
    setSummary1(calculateLoanSummary(newSchedule1));
    setSummary2(calculateLoanSummary(newSchedule2));
  }, [scenario1, scenario2]);

  const handleInputChange = (scenario: '1' | '2', field: keyof LoanParams, value: number | string) => {
    const newValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    if (scenario === '1') {
      setScenario1(prev => {
        const newParams = {
          ...prev,
          [field]: newValue,
        };
        saveTabState('comparison_scenario1', newParams);
        return newParams;
      });
    } else {
      setScenario2(prev => {
        const newParams = {
          ...prev,
          [field]: newValue,
        };
        saveTabState('comparison_scenario2', newParams);
        return newParams;
      });
    }
  };

  const getGraphData = () => {
    return schedule1.filter((_, index) => index % 12 === 0).map((row, i) => ({
      year: Math.floor(row.month / 12),
      balance1: row.remainingBalance,
      balance2: schedule2[i * 12]?.remainingBalance || 0,
      interest1: row.interest,
      interest2: schedule2[i * 12]?.interest || 0,
    }));
  };

  // Advanced graph data preparation functions
  const getPaymentBreakdown = () => {
    if (!summary1 || !summary2) return [];
    return [
      { name: 'Scenario 1 Principal', value: scenario1.loanAmount },
      { name: 'Scenario 1 Interest', value: summary1.totalInterest },
      { name: 'Scenario 2 Principal', value: scenario2.loanAmount },
      { name: 'Scenario 2 Interest', value: summary2.totalInterest }
    ];
  };

  const getTenureComparison = () => {
    return [
      {
        scenario: 'Scenario 1',
        months: schedule1.length,
        totalInterest: summary1.totalInterest,
        totalPayment: summary1.totalPayments
      },
      {
        scenario: 'Scenario 2',
        months: schedule2.length,
        totalInterest: summary2.totalInterest,
        totalPayment: summary2.totalPayments
      }
    ];
  };

  const getRateImpact = () => {
    const rates = [scenario1.annualInterestRate - 1, scenario1.annualInterestRate, scenario1.annualInterestRate + 1];
    return rates.map(rate => {
      const adjustedParams = { ...scenario1, annualInterestRate: rate };
      return {
        rate: `${rate}%`,
        emi: calculateEMI(adjustedParams)
      };
    });
  };

  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Loan Comparison Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Compare different loan scenarios side by side
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Sections */}
          <div className="space-y-8">
            {/* Scenario 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Scenario 1</h2>
              <div className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <label htmlFor="loanAmount1" className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Amount
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100000000"
                    step="100000"
                    value={scenario1.loanAmount}
                    onChange={(e) => handleInputChange('1', 'loanAmount', e.target.value)}
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
                      value={scenario1.loanAmount}
                      onChange={(e) => handleInputChange('1', 'loanAmount', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label htmlFor="annualInterestRate1" className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Interest Rate
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="20"
                    step="0.1"
                    value={scenario1.annualInterestRate}
                    onChange={(e) => handleInputChange('1', 'annualInterestRate', e.target.value)}
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
                      value={scenario1.annualInterestRate}
                      onChange={(e) => handleInputChange('1', 'annualInterestRate', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>

                {/* Loan Tenure */}
                <div>
                  <label htmlFor="loanTenureMonths1" className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Tenure (Months)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="360"
                    step="12"
                    value={scenario1.loanTenureMonths}
                    onChange={(e) => handleInputChange('1', 'loanTenureMonths', e.target.value)}
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
                      value={scenario1.loanTenureMonths}
                      onChange={(e) => handleInputChange('1', 'loanTenureMonths', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Scenario 2</h2>
              <div className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <label htmlFor="loanAmount2" className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Amount
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100000000"
                    step="100000"
                    value={scenario2.loanAmount}
                    onChange={(e) => handleInputChange('2', 'loanAmount', e.target.value)}
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
                      value={scenario2.loanAmount}
                      onChange={(e) => handleInputChange('2', 'loanAmount', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label htmlFor="annualInterestRate2" className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Interest Rate
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="20"
                    step="0.1"
                    value={scenario2.annualInterestRate}
                    onChange={(e) => handleInputChange('2', 'annualInterestRate', e.target.value)}
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
                      value={scenario2.annualInterestRate}
                      onChange={(e) => handleInputChange('2', 'annualInterestRate', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>

                {/* Loan Tenure */}
                <div>
                  <label htmlFor="loanTenureMonths2" className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Tenure (Months)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="360"
                    step="12"
                    value={scenario2.loanTenureMonths}
                    onChange={(e) => handleInputChange('2', 'loanTenureMonths', e.target.value)}
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
                      value={scenario2.loanTenureMonths}
                      onChange={(e) => handleInputChange('2', 'loanTenureMonths', e.target.value)}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Scenario 1 EMI</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary1 && formatCurrency(summary1.monthlyEMI)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Scenario 2 EMI</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {summary2 && formatCurrency(summary2.monthlyEMI)}
                </p>
              </div>
            </div>

            {/* Graph Toggle */}
            <GraphToggle isAdvanced={isAdvanced} onToggle={setIsAdvanced} />

            {/* Basic Graphs */}
            {!isAdvanced && (
              <>
                {/* Balance Comparison Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Balance Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
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
                        <Line
                          type="monotone"
                          dataKey="balance1"
                          stroke="#8884d8"
                          name="Scenario 1"
                        />
                        <Line
                          type="monotone"
                          dataKey="balance2"
                          stroke="#82ca9d"
                          name="Scenario 2"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interest Comparison Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Interest Comparison</h3>
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
                          dataKey="interest1"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name="Scenario 1 Interest"
                        />
                        <Area
                          type="monotone"
                          dataKey="interest2"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name="Scenario 2 Interest"
                        />
                      </AreaChart>
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

                {/* Tenure Comparison Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tenure Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getTenureComparison()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="scenario" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip 
                          formatter={(value: number, name: string) => 
                            name === 'months' ? `${value} months` : formatCurrency(value)
                          }
                        />
                        <Bar yAxisId="left" dataKey="months" fill="#8884d8" name="Loan Tenure" />
                        <Bar yAxisId="right" dataKey="totalInterest" fill="#82ca9d" name="Total Interest" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rate Impact Chart */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Impact Analysis</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getRateImpact()}
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