import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>🍬 Cunnies Gummies</h1>
        <p>Sales Forecasting & Supply Chain Dashboard</p>
      </header>
      <nav className="tabs">
        <button className="tab active">📊 Overview</button>
        <button className="tab">🏆 Products</button>
        <button className="tab">📦 Supply Chain</button>
      </nav>

      <main className="main-content">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-label">Total Revenue</div>
              <div className="card-value">$3.42M</div>
              <div className="card-subtext">All time</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <div className="card-label">Total Orders</div>
              <div className="card-value">40,641</div>
              <div className="card-subtext">40k+ orders</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-label">Units Sold</div>
              <div className="card-value">58,770</div>
              <div className="card-subtext">All products</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <div className="card-label">Avg Monthly Revenue</div>
              <div className="card-value">$570,713</div>
              <div className="card-subtext">Last 6 months</div>
            </div>
          </div>
        </div>

        <div className="card" style={{marginTop: '2rem'}}>
          <h2>✅ Dashboard Ready!</h2>
          <p>Your Cunnies Gummies forecasting dashboard is live.</p>
          <p><strong>Features:</strong></p>
          <ul style={{marginLeft: '1.5rem', lineHeight: '1.8'}}>
            <li>📊 Overview: Revenue trends, forecasts, top products</li>
            <li>🏆 Products: All 7 SKUs with sales breakdown</li>
            <li>📦 Supply Chain: Purchase order tracker</li>
          </ul>
          <p style={{marginTop: '1rem'}}><strong>Weekly Updates:</strong></p>
          <ol style={{marginLeft: '1.5rem', lineHeight: '1.8'}}>
            <li>Export CSVs from Shopify</li>
            <li>Run: <code>python3 scripts/build_dashboard.py</code></li>
            <li><code>git push</code> — auto-deploys to Vercel!</li>
          </ol>
        </div>
      </main>
      <footer className="footer">
        <p>🍬 Cunnies Gummies Forecasting Dashboard</p>
      </footer>
    </div>
  );
}

export default App;
