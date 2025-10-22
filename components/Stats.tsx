'use client';

import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
}

export interface StatsProps {
  stats: StatItem[];
  columns?: number;
}

function Stats({ stats, columns = 4 }: StatsProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4 sm:gap-6`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-zinc-900 rounded-lg shadow p-4 sm:p-6 border border-zinc-700 min-w-0">
          <div className="flex items-center">
            {stat.icon && (
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-md bg-blue-600 text-white">
                  {stat.icon}
                </div>
              </div>
            )}
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-zinc-400 truncate">
                  {stat.label}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-lg sm:text-2xl font-semibold text-zinc-100 truncate min-w-0">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.change.type === 'increase'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      <svg
                        className={`self-center flex-shrink-0 h-4 w-4 ${
                          stat.change.type === 'increase' ? 'text-green-500' : 'text-red-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        {stat.change.type === 'increase' ? (
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                      <span className="ml-1">
                        {stat.change.value}%
                      </span>
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;