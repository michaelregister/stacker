
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  change?: number | null;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, change }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-start justify-between transition-colors">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {change != null && change !== 0 && (
            <span className={`font-bold text-xs flex items-center ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '▲' : '▼'}
              ${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
        {subValue && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subValue}</p>}
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-300">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
