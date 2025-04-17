'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateAdvancedMetrics } from '../utils/advancedCalculations';

interface AdvancedAnalysisProps {
  loanAmount: number;
  loanInterestRate: number;
  loanTenureMonths: number;
  monthlyEMI: number;
  initialAmount: number;
  monthlyInvestment: number;
  expectedReturn: number;
}

export default function AdvancedAnalysis({
  loanAmount,
  loanInterestRate,
  loanTenureMonths,
  monthlyEMI,
  initialAmount,
  monthlyInvestment,
  expectedReturn
}: AdvancedAnalysisProps) {
  const [inflationRate, setInflationRate] = useState(6);

  const metrics = calculateAdvancedMetrics({
    loanAmount,
    loanInterestRate,
    loanTenureMonths,
    monthlyEMI,
    initialAmount,
    monthlyInvestment,
    expectedReturn,
    inflationRate
  });

  return (
    <div className="space-y-8">
      {/* Economic Parameters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Economic Parameters</h3>
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
          <input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loan Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Loan Analysis</h4>
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
          <h4 className="text-lg font-medium text-gray-900 mb-4">Investment Analysis</h4>
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
          <h4 className="text-lg font-medium text-gray-900 mb-4">Comparative Analysis</h4>
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
        <h4 className="text-lg font-medium text-gray-900 mb-4">Investment Growth Analysis</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={Array.from({ length: loanTenureMonths + 1 }, (_, month) => {
                const monthlyRate = expectedReturn / 12 / 100;
                const inflationMonthlyRate = inflationRate / 12 / 100;
                const nominalValue = initialAmount * Math.pow(1 + monthlyRate, month) +
                  monthlyInvestment * ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate);
                const realValue = initialAmount * Math.pow(1 + monthlyRate - inflationMonthlyRate, month) +
                  monthlyInvestment * ((Math.pow(1 + monthlyRate - inflationMonthlyRate, month) - 1) / (monthlyRate - inflationMonthlyRate));
                const totalContributed = initialAmount + monthlyInvestment * month;
                
                return {
                  month,
                  'Nominal Value': nominalValue,
                  'Real Value': realValue,
                  'Total Contributed': totalContributed
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickFormatter={(month) => `${Math.floor(month/12)}y ${month%12}m`}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(month) => `${Math.floor(month/12)} years ${month%12} months`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Total Contributed"
                fill="#f3f4f6"
                stroke="#9ca3af"
                stackId="1"
              />
              <Line
                type="monotone"
                dataKey="Nominal Value"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Real Value"
                stroke="#22c55e"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Analysis Insights</h4>
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
                <li>• Total contributions: {formatCurrency(metrics.totalContributions)}</li>
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
