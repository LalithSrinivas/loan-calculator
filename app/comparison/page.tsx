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
  formatIndianCurrency
} from '../utils/loanCalculations';
import { saveTabState, loadTabState, LoanCachedTabState } from '../utils/cacheUtils';

export default function LoanComparison() {
  const [scenario1, setScenario1] = useState<LoanParams>({
    loanAmount: 3000000,
    annualInterestRate: 8.5,
    loanTenureMonths: 240,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly',
    extraPaymentStartMonth: 1,
  });

  const [scenario2, setScenario2] = useState<LoanParams>({
    loanAmount: 3000000,
    annualInterestRate: 8.5,
    loanTenureMonths: 240,
    extraPayment: 0,
    extraPaymentFrequency: 'monthly',
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

  const [enableExtraPayment1, setEnableExtraPayment1] = useState(false);
  const [enableExtraPayment2, setEnableExtraPayment2] = useState(false);
  const [schedule1, setSchedule1] = useState<any[]>([]);
  const [schedule2, setSchedule2] = useState<any[]>([]);
  const [summary1, setSummary1] = useState<any>(null);
  const [summary2, setSummary2] = useState<any>(null);

  useEffect(() => {
    const newSchedule1 = generateAmortizationSchedule({
      ...scenario1,
      extraPayment: enableExtraPayment1 ? scenario1.extraPayment : 0,
    });
    setSchedule1(newSchedule1);
    setSummary1(calculateLoanSummary(newSchedule1));

    const newSchedule2 = generateAmortizationSchedule({
      ...scenario2,
      extraPayment: enableExtraPayment2 ? scenario2.extraPayment : 0,
    });
    setSchedule2(newSchedule2);
    setSummary2(calculateLoanSummary(newSchedule2));
  }, [scenario1, scenario2, enableExtraPayment1, enableExtraPayment2]);

  const handleInputChange = (scenario: '1' | '2', field: keyof LoanParams, value: number | string) => {
    const setter = scenario === '1' ? setScenario1 : setScenario2;
    setter(prev => {
      const newParams = {
        ...prev,
        [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
      };
      saveTabState(`comparison_scenario${scenario}`, newParams);
      return newParams;
    });
  };

  const getComparisonGraphData = () => {
    const yearlyData = [];
    const maxMonths = Math.max(schedule1.length, schedule2.length);
    
    for (let month = 0; month < maxMonths; month += 12) {
      const year = Math.floor(month / 12);
      const row1 = schedule1[month];
      const row2 = schedule2[month];
      
      yearlyData.push({
        year,
        balance1: row1?.remainingBalance || 0,
        balance2: row2?.remainingBalance || 0,
        principal1: row1?.principal || 0,
        principal2: row2?.principal || 0,
        interest1: row1?.interest || 0,
        interest2: row2?.interest || 0,
      });
    }
    
    return yearlyData;
  };

  const renderInputPanel = (scenario: '1' | '2', params: LoanParams, enableExtraPayment: boolean, setEnableExtraPayment: (value: boolean) => void) => {
    const handleChange = (field: keyof LoanParams, value: number | string) => {
      handleInputChange(scenario, field, value);
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Scenario {scenario}</h2>
        <div className="space-y-6">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <input
              type="range"
              min="100000"
              max="100000000"
              step="100000"
              value={params.loanAmount}
              onChange={(e) => handleChange('loanAmount', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <input
                type="number"
                value={params.loanAmount}
                onChange={(e) => handleChange('loanAmount', e.target.value)}
                className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {formatIndianCurrency(params.loanAmount)}
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
              value={params.annualInterestRate}
              onChange={(e) => handleChange('annualInterestRate', e.target.value)}
              className="w-full"
            />
            <input
              type="number"
              value={params.annualInterestRate}
              onChange={(e) => handleChange('annualInterestRate', e.target.value)}
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
              value={params.loanTenureMonths / 12}
              onChange={(e) => handleChange('loanTenureMonths', parseInt(e.target.value) * 12)}
              className="w-full"
            />
            <input
              type="number"
              value={params.loanTenureMonths / 12}
              onChange={(e) => handleChange('loanTenureMonths', parseInt(e.target.value) * 12)}
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
                    value={params.extraPayment}
                    onChange={(e) => handleChange('extraPayment', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={params.extraPaymentFrequency}
                    onChange={(e) => handleChange('extraPaymentFrequency', e.target.value)}
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Loan Comparison Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Compare two different loan scenarios side by side
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderInputPanel('1', scenario1, enableExtraPayment1, setEnableExtraPayment1)}
          {renderInputPanel('2', scenario2, enableExtraPayment2, setEnableExtraPayment2)}
        </div>

        {/* Comparison Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scenario 1 Summary</h3>
            {summary1 && (
              <div className="space-y-2">
                <p>Monthly EMI: {formatIndianCurrency(calculateEMI(scenario1))}</p>
                <p>Total Interest: {formatIndianCurrency(summary1.totalInterest)}</p>
                <p>Total Amount: {formatIndianCurrency(summary1.totalPayments)}</p>
                <p>Loan Tenure: {summary1.actualTenure} months</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scenario 2 Summary</h3>
            {summary2 && (
              <div className="space-y-2">
                <p>Monthly EMI: {formatIndianCurrency(calculateEMI(scenario2))}</p>
                <p>Total Interest: {formatIndianCurrency(summary2.totalInterest)}</p>
                <p>Total Amount: {formatIndianCurrency(summary2.totalPayments)}</p>
                <p>Loan Tenure: {summary2.actualTenure} months</p>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Charts */}
        <div className="mt-8 space-y-8">
          {/* Balance Comparison Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Balance Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getComparisonGraphData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatIndianCurrency(value)} />
                  <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="balance1"
                    stroke="#8884d8"
                    name="Scenario 1 Balance"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="balance2"
                    stroke="#82ca9d"
                    name="Scenario 2 Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Breakdown Comparison */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Breakdown Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getComparisonGraphData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatIndianCurrency(value)} />
                  <Tooltip formatter={(value) => formatIndianCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="principal1"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Scenario 1 Principal"
                  />
                  <Area
                    type="monotone"
                    dataKey="interest1"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Scenario 1 Interest"
                  />
                  <Area
                    type="monotone"
                    dataKey="principal2"
                    stackId="2"
                    stroke="#ffc658"
                    fill="#ffc658"
                    name="Scenario 2 Principal"
                  />
                  <Area
                    type="monotone"
                    dataKey="interest2"
                    stackId="2"
                    stroke="#ff7300"
                    fill="#ff7300"
                    name="Scenario 2 Interest"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 