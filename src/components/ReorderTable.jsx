import React from 'react';

export default function ReorderTable({ recommendations }) {
  return (
    <div className="reorder-table-container">
      <table className="reorder-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Monthly Burn</th>
            <th>Recommended Order</th>
            <th>Lead Time</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((rec, i) => (
            <tr key={i}>
              <td>
                <div className="product-cell">
                  <div className="product-title">{rec.product}</div>
                  <div className="product-sku">SKU: {rec.sku}</div>
                </div>
              </td>
              <td className="number-cell">{rec.estimated_monthly_burn}</td>
              <td className="number-cell highlight-cell">
                <strong>{rec.recommended_reorder_qty.toLocaleString()}</strong> units
              </td>
              <td className="number-cell">
                <span className="lead-time">{rec.lead_time_weeks}w</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="reorder-notes">
        <p><strong>📋 Lead Time Calculation:</strong></p>
        <ul>
          <li>Production: 12 weeks</li>
          <li>Air Shipping: 7 days</li>
          <li>Sea Shipping: 6 weeks</li>
          <li>Safety Buffer: 4 weeks (extra inventory)</li>
        </ul>
        <p><strong>💡 Recommendation:</strong> Order now if your current inventory will deplete within 14 weeks (12 weeks production + 2 week buffer).</p>
      </div>
    </div>
  );
}
