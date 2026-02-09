import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import {
  fetchOrdersByRange,
  fetchSalesByRange,
  fetchTopVariantsByRange,
  fetchProductTimeSeries,
  getDateRange,
} from '../services/dataService';

export default function DashboardOverview() {
  const [timeRange, setTimeRange] = useState('all');
  const [orders, setOrders] = useState(null);
  const [sales, setSales] = useState(null);
  const [topVariants, setTopVariants] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, salesData, variantsData] = await Promise.all([
          fetchOrdersByRange(timeRange),
          fetchSalesByRange(timeRange),
          fetchTopVariantsByRange(timeRange),
        ]);

        setOrders(ordersData);
        setSales(salesData);
        setTopVariants(variantsData);

        // Aggregate top 3 variants for chart
        const top3 = variantsData.slice(0, 3);
        if (top3.length > 0) {
          const allTimeSeries = await Promise.all(
            top3.map(v => fetchProductTimeSeries(v.sku, timeRange))
          );

          // Prepare chart data (by week)
          const chartPoints = {};
          allTimeSeries.forEach(series => {
            if (series.byWeek && series.byWeek.length > 0) {
              series.byWeek.forEach(point => {
                if (!chartPoints[point.date]) {
                  chartPoints[point.date] = { date: point.date };
                }
                chartPoints[point.date][series.sku] = point.grossSales;
              });
            }
          });

          setChartData(Object.values(chartPoints).sort((a, b) => new Date(a.date) - new Date(b.date)));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(2)}`;
  };

  const formatPercent = (val) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val}%`;
  };

  const getTrendIndicator = (trend) => {
    return trend === 'up' ? '📈' : '📉';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        color: '#d32f2f',
        backgroundColor: '#ffebee',
        borderRadius: '4px',
        margin: '1rem'
      }}>
        <h3>⚠️ Error Loading Data</h3>
        <p>{error}</p>
        <p style={{ fontSize: '0.9rem', color: '#999' }}>
          Check the browser console (F12 → Console) for details.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Time Range Selector */}
      <div className="overview-header">
        <h2>Dashboard Overview</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards">
        {/* Total Sales Card */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Sales</span>
            <span className="kpi-trend" title={`${sales?.comparison.raw >= 0 ? '+' : '-'}${Math.abs(sales?.comparison.raw || 0)}`}>
              {getTrendIndicator(sales?.comparison.trend)} {formatPercent(sales?.comparison.pctChange)}
            </span>
          </div>
          <div className="kpi-value">{formatCurrency(sales?.current || 0)}</div>
          <div className="kpi-comparison">
            vs {formatCurrency(sales?.previous || 0)} previous period
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Orders</span>
            <span className="kpi-trend" title={`${orders?.comparison.raw >= 0 ? '+' : '-'}${Math.abs(orders?.comparison.raw || 0)}`}>
              {getTrendIndicator(orders?.comparison.trend)} {formatPercent(orders?.comparison.pctChange)}
            </span>
          </div>
          <div className="kpi-value">{(orders?.current || 0).toLocaleString()}</div>
          <div className="kpi-comparison">
            vs {(orders?.previous || 0).toLocaleString()} previous period
          </div>
        </div>

        {/* Top Product Variants Card */}
        <div className="kpi-card kpi-card-wide">
          <div className="kpi-header">
            <span className="kpi-title">Top Product Variant</span>
          </div>
          {topVariants && topVariants.length > 0 && (
            <div className="top-variant">
              <div className="variant-name">
                {topVariants[0].productTitle} - {topVariants[0].variantTitle}
              </div>
              <div className="variant-sku">SKU: {topVariants[0].sku}</div>
              <div className="variant-stats">
                <div className="stat">
                  <span className="stat-label">Units Sold</span>
                  <span className="stat-value">{topVariants[0].unitsSold.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Sales</span>
                  <span className="stat-value">{formatCurrency(topVariants[0].grossSales)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Orders</span>
                  <span className="stat-value">{topVariants[0].ordersCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Sales Trend - Top 3 Variants</h3>
        {chartData && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={date => date.substring(5)}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={value => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={value => formatCurrency(value)}
                labelFormatter={label => label}
              />
              {topVariants?.slice(0, 3).map((v, idx) => (
                <Line
                  key={v.sku}
                  type="monotone"
                  dataKey={v.sku}
                  stroke={['#667eea', '#764ba2', '#4ecdc4'][idx]}
                  dot={false}
                  strokeWidth={2}
                  name={`${v.productTitle} (${v.sku})`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Variants Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Top 10 Product Variants</h3>
        <table className="variants-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product - Variant</th>
              <th>SKU</th>
              <th style={{ textAlign: 'right' }}>Units Sold</th>
              <th style={{ textAlign: 'right' }}>Gross Sales</th>
              <th style={{ textAlign: 'right' }}>Orders</th>
            </tr>
          </thead>
          <tbody>
            {topVariants?.slice(0, 10).map((v, idx) => (
              <tr key={v.variantId}>
                <td style={{ fontWeight: 'bold', color: '#667eea' }}>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: '600' }}>{v.productTitle}</div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>{v.variantTitle}</div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{v.sku}</td>
                <td style={{ textAlign: 'right', fontWeight: '500' }}>
                  {v.unitsSold.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontWeight: '500', color: '#667eea' }}>
                  {formatCurrency(v.grossSales)}
                </td>
                <td style={{ textAlign: 'right' }}>{v.ordersCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
