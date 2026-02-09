import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import { fetchProductTimeSeries } from '../services/dataService';

export default function ProductsPage() {
  const [timeRange, setTimeRange] = useState('all');
  const [expandedSku, setExpandedSku] = useState(null);
  const [skuData, setSkuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock SKU list
  const skus = [
    { sku: 'CUNW-100G', product: 'Sour Watermelon', variant: '100g Pack' },
    { sku: 'CUNW-500G', product: 'Sour Watermelon', variant: '500g Pack' },
    { sku: 'CUNP-100G', product: 'Sour Peach', variant: '100g Pack' },
    { sku: 'CUNP-500G', product: 'Sour Peach', variant: '500g Pack' },
    { sku: 'CUNS-100G', product: 'Strawberry', variant: '100g Pack' },
    { sku: 'CUNS-500G', product: 'Strawberry', variant: '500g Pack' },
    { sku: 'CUNA-100G', product: 'Green Apple', variant: '100g Pack' },
    { sku: 'CUNA-500G', product: 'Green Apple', variant: '500g Pack' },
    { sku: 'CUNPW-BLUE', product: 'Pre-Workout', variant: 'Blue Razz' },
    { sku: 'CUNPW-MANGO', product: 'Pre-Workout', variant: 'Mango Madness' },
    { sku: 'CUNPW-CITRUS', product: 'Pre-Workout', variant: 'Citrus Surge' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = {};
        await Promise.all(
          skus.map(async (item) => {
            try {
              const result = await fetchProductTimeSeries(item.sku, timeRange);
              data[item.sku] = result || { sku: item.sku, byDay: [], byWeek: [], byMonth: [], byQuarter: [] };
            } catch (err) {
              console.error(`Error loading ${item.sku}:`, err);
              data[item.sku] = { sku: item.sku, byDay: [], byWeek: [], byMonth: [], byQuarter: [] };
            }
          })
        );
        setSkuData(data);
      } catch (error) {
        console.error('Error loading SKU data:', error);
        setError(error.message || 'Failed to load product data');
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

  const generateCsvExport = (sku) => {
    const series = skuData[sku];
    if (!series) return;

    let csv = 'Date,Units Sold,Gross Sales,Orders\n';
    series.byDay.forEach(d => {
      csv += `${d.date},${d.units},${d.grossSales.toFixed(2)},${d.orders}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${sku}_${timeRange}_trends.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>;
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
        <h3>⚠️ Error Loading Products</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Header with time range selector */}
      <div className="products-header">
        <h2>Product Performance</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Products Table */}
      <div className="card">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product - Variant</th>
              <th>SKU</th>
              <th style={{ textAlign: 'right' }}>Units Sold</th>
              <th style={{ textAlign: 'right' }}>Gross Sales</th>
              <th style={{ textAlign: 'right' }}>Avg Daily</th>
              <th>Trend</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((item) => {
              const data = skuData[item.sku];
              const isExpanded = expandedSku === item.sku;
              const lastDays = data ? data.byDay.slice(-7) : [];
              const trend = lastDays.length > 1 ? lastDays[lastDays.length - 1].units > lastDays[0].units ? '📈' : '📉' : '-';

              return (
                <React.Fragment key={item.sku}>
                  <tr className={isExpanded ? 'expanded' : ''}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.product}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>{item.variant}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{item.sku}</td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>
                      {data ? data.totals.units.toLocaleString() : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '500', color: '#667eea' }}>
                      {data ? formatCurrency(data.totals.sales) : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {data ? (data.totals.units / data.byDay.length).toFixed(0) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>{trend}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-expand"
                        onClick={() => setExpandedSku(isExpanded ? null : item.sku)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Detail Row */}
                  {isExpanded && data && (
                    <tr className="detail-row">
                      <td colSpan="7">
                        <div className="sku-detail-panel">
                          {/* Summary Stats */}
                          <div className="detail-summary">
                            <div className="summary-item">
                              <span className="summary-label">Total Units</span>
                              <span className="summary-value">{data.totals.units.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Total Sales</span>
                              <span className="summary-value">{formatCurrency(data.totals.sales)}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Total Orders</span>
                              <span className="summary-value">{data.totals.orders.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Avg per Order</span>
                              <span className="summary-value">
                                {(data.totals.units / data.totals.orders).toFixed(1)} units
                              </span>
                            </div>
                          </div>

                          {/* Trend Selector */}
                          <div className="trend-selector">
                            <label>View by:</label>
                            <div className="trend-buttons">
                              <button className="trend-btn active">Daily</button>
                              <button className="trend-btn">Weekly</button>
                              <button className="trend-btn">Monthly</button>
                              <button className="trend-btn">Quarterly</button>
                            </div>
                          </div>

                          {/* Daily Trend Chart */}
                          <div className="detail-chart">
                            <h4>Daily Sales Trend</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={data.byDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  tickFormatter={date => date.substring(5)}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                  formatter={value => value}
                                  labelFormatter={label => label}
                                />
                                <Bar dataKey="units" fill="#667eea" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Weekly Aggregation */}
                          <div className="detail-chart">
                            <h4>Weekly Sales</h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={data.byWeek}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  tickFormatter={date => date.substring(5)}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                  formatter={value => value}
                                  labelFormatter={label => label}
                                />
                                <Bar dataKey="units" fill="#764ba2" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Export & Close */}
                          <div className="detail-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => generateCsvExport(item.sku)}
                            >
                              📥 Export CSV
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => setExpandedSku(null)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Portfolio Summary</h3>
        <div className="portfolio-summary">
          {skus.map(item => {
            const data = skuData[item.sku];
            return (
              <div key={item.sku} className="summary-card-mini">
                <div className="mini-card-header">{item.sku}</div>
                <div className="mini-card-stat">{data ? (data.totals.units / 1000).toFixed(1) : '-'}K units</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
