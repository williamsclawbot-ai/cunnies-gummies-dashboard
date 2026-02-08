import React from 'react';

export default function SummaryCards({ data }) {
  const cards = [
    {
      label: 'Total Revenue',
      value: `$${(data.total_revenue_all_time / 1000000).toFixed(2)}M`,
      icon: '💰',
      subtext: 'All time'
    },
    {
      label: 'Total Orders',
      value: data.total_orders_all_time.toLocaleString(),
      icon: '📦',
      subtext: '40k+ orders'
    },
    {
      label: 'Units Sold',
      value: Math.round(data.total_units_sold).toLocaleString(),
      icon: '📊',
      subtext: 'All products'
    },
    {
      label: 'Avg Monthly Revenue',
      value: `$${Math.round(data.average_monthly_revenue).toLocaleString()}`,
      icon: '📈',
      subtext: `Last ${data.active_months} months`
    }
  ];

  return (
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
  );
}
