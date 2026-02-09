import React, { useState, useMemo } from 'react';
import { filterMonthlyData, calculateMetrics, getPeriodLabel } from '../utils/dateFilters';
import { SalesChart } from './SalesChart';

export default function SummaryCards({ data }) {
  const [period, setPeriod] = useState('all');

  const filteredMetrics = useMemo(() => {
    if (period === 'all') {
      return {
        total_orders: data.summary.total_orders_all_time,
        total_revenue: data.summary.total_revenue_all_time,
        avg_aov: data.summary.total_revenue_all_time / data.summary.total_orders_all_time,
        label: 'All Time'
      };
    }

    const filtered = filterMonthlyData(data.monthly_trends, period);
    const metrics = calculateMetrics(filtered);
    return {
      ...metrics,
      label: getPeriodLabel(period)
    };
  }, [period, data]);

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
        <div className="time-range-selector">
          <button 
            className={`selector-btn ${period === 'daily' ? 'active' : ''}`}
            onClick={() => setPeriod('daily')}
          >
            Daily
          </button>
          <button 
            className={`selector-btn ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`selector-btn ${period === 'mtd' ? 'active' : ''}`}
            onClick={() => setPeriod('mtd')}
          >
            MTD
          </button>
          <button 
            className={`selector-btn ${period === 'ytd' ? 'active' : ''}`}
            onClick={() => setPeriod('ytd')}
          >
            YTD
          </button>
          <button 
            className={`selector-btn ${period === 'all' ? 'active' : ''}`}
            onClick={() => setPeriod('all')}
          >
            All Time
          </button>
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
        <SalesChart data={data.monthly_trends} period={period} />
      </div>
    </div>
  );
}
