import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProductAnalysis({ products }) {
  const chartData = products.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    units: p.units_sold,
    sku: p.sku
  }));

  return (
    <div className="product-analysis">
      <ResponsiveContainer width="100%" height={250}>
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
        {products.map((p, i) => {
          const pct = (p.units_sold / products.reduce((sum, prod) => sum + prod.units_sold, 0) * 100).toFixed(1);
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
  );
}
