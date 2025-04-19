'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateAdvancedMetrics, calculateTaxSavings, calculateRemainingLoanBalance, calculateROI, calculateYearsToFI, calculateRetirementCorpus, comparePrepaymentVsInvestment, calculateRequiredMonthlyInvestment } from '../utils/advancedCalculations';
import FinancialTooltip from './FinancialTooltip';

interface AdvancedAnalysisProps {
  loanAmount: number;
  annualInterestRate: number;
  loanTenureMonths: number;
  monthlyEMI: number;
  initialAmount: number;
  monthlyInvestment: number;
  expectedReturn: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdvancedAnalysis({
  loanAmount,
  annualInterestRate,
  loanTenureMonths,
  monthlyEMI,
  initialAmount,
  monthlyInvestment,
  expectedReturn
}: AdvancedAnalysisProps) {
  const [inflationRate, setInflationRate] = useState(6);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [retirementInYears, setRetirementInYears] = useState(30);
  const metrics = calculateAdvancedMetrics({
    loanAmount,
    loanInterestRate: annualInterestRate,
    loanTenureMonths,
    monthlyEMI,
    initialAmount,
    monthlyInvestment,
    expectedReturn,
    inflationRate
  });

  // Calculate additional metrics
  const annualInterestPaid = (monthlyEMI * 12) - (loanAmount / (loanTenureMonths / 12));
  const taxSavings = calculateTaxSavings(annualInterestPaid);
  const roi = calculateROI({
    loanAmount: loanAmount,
    loanInterestRate: annualInterestRate,
    loanTenureMonths: loanTenureMonths,
    monthlyEMI: monthlyEMI,
    initialAmount: initialAmount,
    monthlyInvestment: monthlyInvestment,
    expectedReturn: expectedReturn / 100,
    inflationRate: inflationRate / 100
  });
  
  const yearsToFI = calculateYearsToFI(
    monthlyExpenses * 12,
    monthlyInvestment * 12,
    expectedReturn - inflationRate
  );

  const retirementCorpus = calculateRetirementCorpus(
    monthlyExpenses,
    inflationRate,
    expectedReturn,
    Math.ceil(yearsToFI)
  );

  const investmentVsPrePayment = comparePrepaymentVsInvestment(
    loanAmount,
    annualInterestRate,
    loanTenureMonths,
    monthlyInvestment,
    'monthly',
    expectedReturn
  );

  // Prepare comparison data
  const loanSplit = [
    {
      name: 'Loan Principal',
      value: loanAmount
    },
    {
      name: 'Interest Paid',
      value: metrics.totalInterestPaid
    }
  ];

    // Prepare comparison data
    const investmentSplit = [
      {
        name: 'Investment',
        value: metrics.totalInvestmentContributions
      },
      {
        name: 'Returns',
        value: metrics.totalEarnings
      }
    ];

  return (
    <div className="space-y-8">
      {/* Economic Parameters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <FinancialTooltip
            term="Economic Parameters"
            explanation="Factors that affect your financial planning like inflation (rising prices) and your monthly expenses"
          />
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Inflation Rate (%)</label>
            <input
              type="range"
              min="2"
              max="10"
              step="0.1"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2%</span>
              <span>10%</span>
            </div>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Expenses</label>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Risk Tolerance</label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as 'conservative' | 'moderate' | 'aggressive')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Planning to Retire in (years)</label>
            <input
              type="number"
              value={retirementInYears}
              onChange={(e) => setRetirementInYears(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Financial Independence Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <FinancialTooltip
            term="Path to Financial Independence"
            explanation="The journey to having enough money to cover your living expenses without needing to work"
          />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                <FinancialTooltip
                  term="Years to Financial Independence"
                  explanation="How many years it will take to save enough money to stop working, based on your current savings and expenses"
                />
              </h4>
              <p className="text-3xl font-bold text-blue-600">{yearsToFI.toFixed(1)} years</p>
              <p className="text-sm text-blue-800 mt-2">Based on current savings rate and expenses</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">
                <FinancialTooltip
                  term="Required Retirement Corpus"
                  explanation="The total amount of money you need to save to maintain your lifestyle after retirement"
                />
              </h4>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(retirementCorpus)}</p>
              <p className="text-sm text-green-800 mt-2">Using 4% safe withdrawal rate</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Monthly Investment Required</h4>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(calculateRequiredMonthlyInvestment(retirementCorpus, initialAmount, expectedReturn, retirementInYears*12))}
              </p>
              <p className="text-sm text-purple-800 mt-2">To reach retirement corpus</p>
            </div>
          </div>
        </div>
      </div>

     {/* Investment Strategy Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <FinancialTooltip
            term="Investment Strategy Comparison"
            explanation="Comparing different ways to grow your money, like investing in stocks vs paying off loans"
          />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Charts Section */}
          <div className="space-y-6">
            {/* Loan Split Pie Chart */}
            <div className="flex flex-col items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loanSplit}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {loanSplit.map((entry, index) => (
                        <Cell key={`cell-loan-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Split between loan principal and interest paid
              </p>
            </div>

            {/* Investment Split Pie Chart */}
            <div className="flex flex-col items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investmentSplit}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    >
                      {investmentSplit.map((entry, index) => (
                        <Cell key={`cell-invest-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Split between investment and returns
              </p>
            </div>
          </div>

          {/* Strategy Analysis Section */}
          <div className="space-y-4">
            {/* Investment Strategy Analysis */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                If You Choose to Invest {formatCurrency(monthlyInvestment)} per month
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Return on Investment (ROI): {roi.toFixed(2)}%</li>
                <li>• Real Return After Inflation: {metrics.realReturnAfterInflation.toFixed(2)}%</li>
                <li>• Net Gain from Investment: {formatCurrency(investmentVsPrePayment.netGainFromInvestment)}</li>
                <li>• Loan Tenure (without prepayment): {loanTenureMonths} months</li>
                <li>• Total Interest Paid (without prepayment): {formatCurrency(investmentVsPrePayment.totalInterestWithoutPrepayment)}</li>
              </ul>
            </div>

            {/* Prepayment Strategy Analysis */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">
                If You Choose to Prepay {formatCurrency(monthlyInvestment)} per month
              </h4>
              <ul className="space-y-2 text-sm text-purple-800">
                <li>• Effective Interest Rate (post prepayment): {metrics.effectiveInterestRate.toFixed(2)}%</li>
                <li>• Loan Tenure (with prepayment): {investmentVsPrePayment.monthsTakenToRepayLoan} months</li>
                <li>• Total Interest Saved via Prepayment: {formatCurrency(investmentVsPrePayment.interestSaved)}</li>
                <li>• Total Interest Paid (with prepayment): {formatCurrency(investmentVsPrePayment.totalInterestPaid)}</li>
              </ul>
            </div>

            {/* Investment vs Prepayment Outcome */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Investment vs Prepayment</h4>
              <p className="text-sm text-green-800">
                {investmentVsPrePayment.difference < 0
                  ? `📈 Investing yields ${formatCurrency(Math.abs(investmentVsPrePayment.difference))} more than prepaying the loan.`
                  : `🏦 Prepaying saves you ${formatCurrency(Math.abs(investmentVsPrePayment.difference))} over investing.`}
              </p>
            </div>

            {/* Summary Decision */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Summary Decision</h4>
              <p className="text-sm text-yellow-800">
                Recommended Option: <strong>{investmentVsPrePayment.betterOption}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loan Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            <FinancialTooltip
              term="Loan Analysis"
              explanation="Understanding how much you'll pay in interest and the true cost of your loan"
            />
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Interest Paid</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalInterestPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Effective Interest Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics.effectiveInterestRate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Loan Cost Ratio</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.loanCostRatio.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Investment Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            <FinancialTooltip
              term="Investment Analysis"
              explanation="Understanding how your investments grow over time and the returns you can expect"
            />
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Investment Value</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalInvestmentValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalEarnings)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Effective Return Rate</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.effectiveReturnRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Comparative Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            <FinancialTooltip
              term="Comparative Analysis"
              explanation="Comparing different financial options to help you make better decisions"
            />
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Investment vs Loan Ratio</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.investmentVsLoanRatio.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Break-even Point</p>
              <p className="text-2xl font-bold text-green-600">{Math.ceil(metrics.breakevenPoint)} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Real Return (After Inflation)</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.realReturnAfterInflation.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Growth Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          <FinancialTooltip
            term="Net Possession Over Time"
            explanation="Shows how your total wealth (investments minus loans) changes over the years"
          />
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={Array.from({ length: Math.max(loanTenureMonths, 1) }, (_, month) => {
                const monthlyRate = expectedReturn / 12 / 100;
                const loanBalance = calculateRemainingLoanBalance(
                  loanAmount,
                  annualInterestRate,
                  loanTenureMonths,
                  month
                );
                const incomeBalance = initialAmount * Math.pow(1 + monthlyRate, month) +
                  monthlyInvestment * ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate);
                const netPossession = incomeBalance - loanBalance;
                
                return {
                  month,
                  'Loan Balance': loanBalance,
                  'Income Balance': incomeBalance,
                  'Net Possession': netPossession
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickFormatter={(month) => `${Math.floor(month/12)}y ${month%12}m`}
                interval={Math.max(Math.floor(loanTenureMonths / 10), 1)}
                domain={[0, loanTenureMonths]}
              />
              <YAxis 
                tickFormatter={(value) => `₹${Math.abs(value/100000).toFixed(2)}L`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(month) => `${Math.floor(month/12)}y ${month%12}m`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Loan Balance"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Income Balance"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Net Possession"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
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
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          <FinancialTooltip
            term="Monthly Income Growth"
            explanation="How your investment income grows each month, showing the power of compound interest"
          />
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={Array.from({ length: Math.max(loanTenureMonths, 1) }, (_, month) => {
                const monthlyRate = expectedReturn / 12 / 100;
                const monthlyIncome = monthlyInvestment * Math.pow(1 + monthlyRate, month);
                
                return {
                  month,
                  'Monthly Income': monthlyIncome
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickFormatter={(month) => `Year ${Math.floor(month/12)}`}
                interval={Math.max(Math.floor(loanTenureMonths / 10), 1)}
                domain={[0, loanTenureMonths]}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(month) => `Year ${Math.floor(month/12)}`}
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

      {/* Analysis Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          <FinancialTooltip
            term="Analysis Insights"
            explanation="Key findings and recommendations based on your financial situation"
          />
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Loan Cost Analysis</h5>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Total loan payment: {formatCurrency(metrics.totalLoanPayment)}</li>
                <li>• Interest cost ratio: {metrics.loanCostRatio.toFixed(2)}% of principal</li>
                <li>• Effective monthly cost: {formatCurrency(metrics.totalLoanPayment / loanTenureMonths)}</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Investment Performance</h5>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Total contributions: {formatCurrency(metrics.totalInvestmentContributions)}</li>
                <li>• Investment earnings: {formatCurrency(metrics.totalEarnings)}</li>
                <li>• Wealth accumulation rate: {metrics.wealthAccumulationRate.toFixed(2)}%</li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-2">Comparative Insights</h5>
              <ul className="space-y-2 text-sm text-purple-800">
                <li>• Investment growth vs loan cost ratio: {metrics.investmentVsLoanRatio.toFixed(2)}%</li>
                <li>• Break-even timeline: {Math.floor(metrics.breakevenPoint/12)} years {metrics.breakevenPoint%12} months</li>
                <li>• Real returns after inflation: {metrics.realReturnAfterInflation.toFixed(2)}%</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h5 className="font-medium text-orange-900 mb-2">Strategy Recommendations</h5>
              <ul className="space-y-2 text-sm text-orange-800">
                <li>• {metrics.investmentVsLoanRatio > 100 ? 'Investment returns outpace loan costs' : 'Consider loan prepayment'}</li>
                <li>• {metrics.realReturnAfterInflation > metrics.effectiveInterestRate ? 'Maintain investment strategy' : 'Review investment allocation'}</li>
                <li>• Break-even point suggests {metrics.breakevenPoint < loanTenureMonths/2 ? 'effective' : 'challenging'} wealth building strategy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
