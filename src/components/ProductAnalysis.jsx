import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { filterProductData, getPeriodLabel, filterByMonth } from '../utils/dateFilters';

export default function ProductAnalysis({ products, monthlyData }) {
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Generate available months from data
  const availableMonths = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return [];
    }
    
    const months = monthlyData.map(trend => {
      const date = new Date(trend.month || trend.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }).filter((v, i, a) => a.indexOf(v) === i).sort().reverse();
    
    return months;
  }, [monthlyData]);

  const filteredProducts = useMemo(() => {
    if (selectedMonth === 'all') return products;
    return filterProductData(products, monthlyData, selectedMonth);
  }, [products, monthlyData, selectedMonth]);

  const chartData = filteredProducts.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    units: p.units_sold,
    sku: p.sku
  }));

  const totalUnits = filteredProducts.reduce((sum, p) => sum + p.units_sold, 0);

  return (
    <div className="product-analysis-section">
      <div className="section-header">
        <h2>🏆 Product Performance</h2>
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

      <div className="product-analysis">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#666"
              label={{ value: 'Units Sold', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => value.toLocaleString()}
              contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
            />
            <Bar 
              dataKey="units" 
              fill="#ffd93d"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="product-list">
          <div className="period-info">
            Showing data for: <strong>{getPeriodLabel(selectedMonth)}</strong>
          </div>
          {filteredProducts.map((p, i) => {
            const pct = totalUnits > 0 ? (p.units_sold / totalUnits * 100).toFixed(1) : 0;
            return (
              <div key={i} className="product-item">
                <div className="product-rank">#{i + 1}</div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-sku">SKU: {p.sku}</div>
                </div>
                <div className="product-stats">
                  <div className="product-units">{p.units_sold.toLocaleString()} units</div>
                  <div className="product-pct">{pct}% of total</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
