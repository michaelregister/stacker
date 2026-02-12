import React, { useMemo } from 'react';
import { calculatePortfolioMetrics } from '../utils/stackCalculations';

const PerformanceSummary = ({ items, currentSpotPrice }) => {
  // Memoize calculations to prevent re-running on every render unless data changes
  const metrics = useMemo(() => {
    return calculatePortfolioMetrics(items, currentSpotPrice);
  }, [items, currentSpotPrice]);

  const isProfitable = metrics.unrealizedGainLoss >= 0;
  const profitColor = isProfitable ? 'text-green-600' : 'text-red-600';
  const arrow = isProfitable ? '▲' : '▼';

  // Helper for currency formatting
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Performance Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Invested (Cost Basis) */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(metrics.totalCostBasis)}
          </p>
        </div>

        {/* Current Portfolio Value */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(metrics.currentValue)}
          </p>
        </div>

        {/* Portfolio DCA (Average Cost per Oz) */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio DCA / oz</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(metrics.portfolioDCA)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Based on {metrics.totalOunces.toFixed(2)} oz owned
          </p>
        </div>

        {/* Unrealized Gain / Loss */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unrealized P&L</p>
          <div className="flex items-baseline mt-1">
            <p className={`text-2xl font-bold ${profitColor}`}>
              {isProfitable ? '+' : ''}{formatCurrency(metrics.unrealizedGainLoss)}
            </p>
            <span className={`ml-2 text-sm font-medium ${profitColor}`}>
              {arrow} {Math.abs(metrics.percentageReturn).toFixed(2)}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceSummary;