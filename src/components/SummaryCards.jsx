import React, { useState, useMemo } from 'react';
import { filterByMonth, calculateMetrics, getPeriodLabel, getMonthDateRange, getPreviousMonthRange } from '../utils/dateFilters';
import { SalesChart } from './SalesChart';

export default function SummaryCards({ data }) {
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Generate available months from data
  const availableMonths = useMemo(() => {
    if (!data.monthly_trends || data.monthly_trends.length === 0) {
      return [];
    }
    
    const months = data.monthly_trends.map(trend => {
      const date = new Date(trend.month || trend.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }).filter((v, i, a) => a.indexOf(v) === i).sort().reverse();
    
    return months;
  }, [data.monthly_trends]);

  const filteredMetrics = useMemo(() => {
    if (selectedMonth === 'all') {
      return {
        total_orders: data.summary.total_orders_all_time,
        total_revenue: data.summary.total_revenue_all_time,
        avg_aov: data.summary.total_revenue_all_time / data.summary.total_orders_all_time,
        label: 'All Time'
      };
    }

    const filtered = filterByMonth(data.monthly_trends, selectedMonth);
    const metrics = calculateMetrics(filtered);
    return {
      ...metrics,
      label: getPeriodLabel(selectedMonth)
    };
  }, [selectedMonth, data]);

  const cards = [
    {
      label: 'Total Revenue',
      value: filteredMetrics.total_revenue > 1000000 
        ? `$${(filteredMetrics.total_revenue / 1000000).toFixed(2)}M`
        : `$${Math.round(filteredMetrics.total_revenue).toLocaleString()}`,
      icon: '💰',
      subtext: filteredMetrics.label
    },
    {
      label: 'Total Orders',
      value: filteredMetrics.total_orders.toLocaleString(),
      icon: '📦',
      subtext: filteredMetrics.label
    },
    {
      label: 'Avg Order Value',
      value: `$${filteredMetrics.avg_aov.toFixed(2)}`,
      icon: '💳',
      subtext: filteredMetrics.label
    },
    {
      label: 'Revenue per Order',
      value: `$${(filteredMetrics.total_revenue / Math.max(filteredMetrics.total_orders, 1)).toFixed(2)}`,
      icon: '📈',
      subtext: filteredMetrics.label
    }
  ];

  return (
    <div className="summary-section">
      <div className="summary-header">
        <h2>📊 Overview</h2>
        <div className="month-selector">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-dropdown"
          >
            <option value="all">All Time (YTD/all data)</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {getPeriodLabel(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="summary-cards">
        {cards.map((card, i) => (
          <div key={i} className="summary-card">
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <div className="card-label">{card.label}</div>
              <div className="card-value">{card.value}</div>
              <div className="card-subtext">{card.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-section" style={{ marginTop: '2rem' }}>
        <h3>Sales Trend</h3>
        <SalesChart data={data.monthly_trends} period={selectedMonth} />
      </div>
    </div>
  );
}
