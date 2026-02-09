import React from 'react';

export default function SupplyChainTracker({ supplyChain }) {
  if (!supplyChain || supplyChain.length === 0) {
    return (
      <div className="supply-chain-tracker">
        <h2>📦 Supply Chain Inventory</h2>
        <div className="empty-state">
          <p>No supply chain data available</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    const icons = {
      'Healthy': '✅',
      'Adequate': '⚠️',
      'Low': '🔴',
      'Critical': '🚨'
    };
    return icons[status] || '📦';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Healthy': '#10b981',
      'Adequate': '#f59e0b',
      'Low': '#ef4444',
      'Critical': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  // Sort by status priority (Critical first, then Low, Adequate, Healthy)
  const sortedSupplyChain = [...supplyChain].sort((a, b) => {
    const priority = { 'Critical': 0, 'Low': 1, 'Adequate': 2, 'Healthy': 3 };
    return (priority[a.status] || 4) - (priority[b.status] || 4);
  });

  return (
    <div className="supply-chain-tracker">
      <div className="tracker-header">
        <h2>📦 Supply Chain Inventory</h2>
        <p className="header-subtext">Real-time inventory levels and projected stockout dates</p>
      </div>

      <div className="supply-chain-table-wrapper">
        <table className="supply-chain-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>On Hand (units)</th>
              <th>Monthly Velocity</th>
              <th>Weeks of Cover</th>
              <th>Status</th>
              <th>Projected Stockout</th>
            </tr>
          </thead>
          <tbody>
            {sortedSupplyChain.map((item, idx) => {
              const stockoutDate = new Date(item.projected_stockout);
              const today = new Date();
              const daysUntilStockout = Math.ceil((stockoutDate - today) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilStockout <= 14;

              return (
                <tr key={idx} className={`supply-row ${isUrgent ? 'urgent' : ''}`}>
                  <td className="sku-cell">
                    <code>{item.sku}</code>
                  </td>
                  <td className="product-cell">
                    <strong>{item.product}</strong>
                  </td>
                  <td className="numeric">
                    {item.on_hand.toLocaleString()}
                  </td>
                  <td className="numeric">
                    {item.monthly_velocity.toLocaleString()} units/month
                  </td>
                  <td className="numeric">
                    <strong>{item.weeks_of_cover} weeks</strong>
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {stockoutDate.toLocaleDateString('en-AU')}
                    {isUrgent && (
                      <div className="urgency-label">
                        ⏰ {daysUntilStockout} days
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="supply-chain-footer">
        <div className="status-legend">
          <div className="legend-item">
            <span className="legend-badge" style={{ backgroundColor: '#10b981' }}>✅</span>
            <span>Healthy: 12+ weeks of cover</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ backgroundColor: '#f59e0b' }}>⚠️</span>
            <span>Adequate: 6-11 weeks of cover</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ backgroundColor: '#ef4444' }}>🔴</span>
            <span>Low: 2-5 weeks of cover</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ backgroundColor: '#dc2626' }}>🚨</span>
            <span>Critical: &lt;2 weeks of cover</span>
          </div>
        </div>

        <div className="supply-chain-summary">
          <h3>Inventory Summary</h3>
          <ul>
            <li>Total SKUs tracked: {supplyChain.length}</li>
            <li>Products at risk (Low/Critical): {supplyChain.filter(s => s.status === 'Low' || s.status === 'Critical').length}</li>
            <li>Healthy inventory: {supplyChain.filter(s => s.status === 'Healthy').length}</li>
            <li>Recommended action: Review and reorder any products with &lt; 4 weeks of cover</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
