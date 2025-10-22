'use client';

import React from 'react';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  showValues?: boolean;
  title?: string;
}

function BarChart({
  data,
  width,
  height = 300,
  showValues = true,
  title,
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = width || Math.min(800, Math.max(400, data.length * 60)); // Responsive width
  const barWidth = (chartWidth - 60) / data.length;
  const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="bg-zinc-900 p-4 rounded-lg shadow border border-zinc-700 w-full overflow-x-auto">
      {title && (
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">{title}</h3>
      )}
      <div className="min-w-0">
        <svg width={chartWidth} height={height} className="overflow-visible">
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = height - 40 - (percent / 100) * (height - 80);
            return (
              <g key={percent}>
                <text
                  x={30}
                  y={y + 4}
                  className="text-xs fill-zinc-400"
                  textAnchor="end"
                >
                  {Math.round((percent / 100) * maxValue)}
                </text>
                <line
                  x1={40}
                  y1={y}
                  x2={chartWidth - 20}
                  y2={y}
                  stroke="#374151"
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 80);
            const x = 50 + index * barWidth;
            const y = height - 40 - barHeight;
            const color = item.color || defaultColors[index % defaultColors.length];

            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth - 10}
                  height={barHeight}
                  fill={color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  rx={4}
                />
                {showValues && (
                  <text
                    x={x + (barWidth - 10) / 2}
                    y={y - 5}
                    className="text-xs fill-zinc-300 font-medium"
                    textAnchor="middle"
                  >
                    {item.value}
                  </text>
                )}
                <text
                  x={x + (barWidth - 10) / 2}
                  y={height - 20}
                  className="text-xs fill-zinc-400"
                  textAnchor="middle"
                  transform={`rotate(-45, ${x + (barWidth - 10) / 2}, ${height - 20})`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default BarChart;