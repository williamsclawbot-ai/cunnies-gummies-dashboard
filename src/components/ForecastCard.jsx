import React from 'react';

export default function ForecastCard({ forecast }) {
  return (
    <div className="forecast-card">
      <div className="forecast-item">
        <div className="forecast-label">Projected Orders</div>
        <div className="forecast-value">{parseInt(forecast.projected_orders).toLocaleString()}</div>
        <div className="forecast-note">orders next month</div>
      </div>

      <div className="forecast-item">
        <div className="forecast-label">Projected AOV</div>
        <div className="forecast-value">{forecast.projected_aov}</div>
        <div className="forecast-note">average order value</div>
      </div>

      <div className="forecast-item highlight">
        <div className="forecast-label">Projected Revenue</div>
        <div className="forecast-value">{forecast.projected_revenue}</div>
        <div className="forecast-note">monthly revenue</div>
      </div>

      <div className="forecast-confidence">
        <div className="confidence-label">Forecast Confidence</div>
        <div className="confidence-value">{forecast.confidence}</div>
        <div className="confidence-note">Based on 3-month moving average</div>
      </div>

      <div className="forecast-disclaimer">
        <p>💡 <strong>Note:</strong> This forecast assumes normal business conditions. Seasonal events, promotions, or changes in marketing spend may affect actual results.</p>
      </div>
    </div>
  );
}
