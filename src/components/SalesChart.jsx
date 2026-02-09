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

function SalesChart({ data, period = 'all', selectedMonth = 'all' }) {
  const chartData = useMemo(() => {
    // Determine if we're showing daily or monthly data
    const isMonthSelected = selectedMonth && selectedMonth !== 'all' && selectedMonth.match(/^\d{4}-\d{2}$/);
    
    if (isMonthSelected) {
      // Show daily trend for selected month
      return generateDailyTrendData(data, selectedMonth);
    } else {
      // Show monthly trend (all time)
      let filtered = data;
      
      if (period !== 'all') {
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
    }
  }, [data, period, selectedMonth]);

  const chartTitle = useMemo(() => {
    if (selectedMonth && selectedMonth !== 'all' && selectedMonth.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }) + ' Daily Sales Trend';
    }
    return 'Monthly Sales Trend';
  }, [selectedMonth]);

  return (
    <div className="chart-container">
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#333' }}>{chartTitle}</h4>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey={selectedMonth && selectedMonth !== 'all' ? 'day' : 'month'} 
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
            dot={false}
            activeDot={{ r: 6 }}
            name="Revenue ($)"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="#4ecdc4" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Generate daily trend data for a selected month
 * @param {Array} monthlyData - Array of monthly trend objects
 * @param {string} monthKey - Format: 'YYYY-MM' (e.g., '2025-10')
 * @returns {Array} Daily data for the month
 */
function generateDailyTrendData(monthlyData, monthKey) {
  // Find the month data
  const monthData = monthlyData.find(m => m.monthYear === monthKey || m.month === monthKey);
  
  if (!monthData) {
    return [];
  }

  // Parse the month
  const [year, month] = monthKey.split('-');
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  // Get number of days in month
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  
  // Calculate daily average
  const dailyOrders = Math.round(monthData.orders / daysInMonth);
  const dailyRevenue = Math.round((monthData.orders * monthData.aov) / daysInMonth);
  
  // Generate daily data
  const dailyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(yearNum, monthNum - 1, day);
    const dayName = date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
    
    dailyData.push({
      day: dayName,
      orders: dailyOrders,
      revenue: dailyRevenue,
      aov: Math.round(monthData.aov * 100) / 100
    });
  }
  
  return dailyData;
}

export default SalesChart;
export { SalesChart };
