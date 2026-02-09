import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { filterMonthlyData, filterByMonth } from '../utils/dateFilters';

function SalesChart({ data, period = 'all' }) {
  const chartData = useMemo(() => {
    let filtered = data;
    
    if (period !== 'all') {
      // Check if it's a month key (YYYY-MM format)
      const isMonthKey = period && period.match(/^\d{4}-\d{2}$/);
      filtered = isMonthKey ? filterByMonth(data, period) : filterMonthlyData(data, period);
    }
    
    return filtered
      .filter(m => m.orders > 0)
      .map(m => ({
        month: new Date(m.month).toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
        orders: m.orders,
        revenue: Math.round(m.orders * m.aov),
        aov: Math.round(m.aov * 100) / 100,
        date: m.month
      }));
  }, [data, period]);

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#666"
            label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="#666"
            label={{ value: 'Orders', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
            contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="#ff6b6b" 
            strokeWidth={2}
            dot={{ fill: '#ff6b6b', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue ($)"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="#4ecdc4" 
            strokeWidth={2}
            dot={{ fill: '#4ecdc4', r: 4 }}
            activeDot={{ r: 6 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;
export { SalesChart };
