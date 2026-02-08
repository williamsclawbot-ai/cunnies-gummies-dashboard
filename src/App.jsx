import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app">
      <header className="header">
        <h1>🍬 Cunnies Gummies</h1>
        <p>Sales Forecasting & Supply Chain Dashboard</p>
      </header>

      <nav className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🏆 Products
        </button>
        <button 
          className={`tab ${activeTab === 'supply' ? 'active' : ''}`}
          onClick={() => setActiveTab('supply')}
        >
          📦 Supply Chain
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
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
              <h2>📊 Sales Overview</h2>
              <p>Your Cunnies Gummies business is thriving!</p>
              <ul style={{marginLeft: '1.5rem', lineHeight: '2'}}>
                <li><strong>$3.42M</strong> total revenue in 6 months</li>
                <li><strong>40,641</strong> orders processed</li>
                <li><strong>$570K</strong> average monthly revenue</li>
                <li><strong>58,770</strong> units sold across 7 SKUs</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="card">
              <h2>🏆 Product Performance</h2>
              <table style={{width: '100%', marginTop: '1rem', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #ddd'}}>
                    <th style={{textAlign: 'left', padding: '0.75rem'}}>Product</th>
                    <th style={{textAlign: 'right', padding: '0.75rem'}}>Units Sold</th>
                    <th style={{textAlign: 'right', padding: '0.75rem'}}>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '0.75rem'}}>Sour Watermelon</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>25,777</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>43.8%</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '0.75rem'}}>Sour Peach</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>17,081</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>29.0%</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '0.75rem'}}>Strawberry</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>8,487</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>14.4%</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '0.75rem'}}>Green Apple</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>6,146</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>10.4%</td>
                  </tr>
                  <tr>
                    <td style={{padding: '0.75rem'}}>Pre-Workout Flavors (3)</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>1,352</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>2.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="tab-content">
            <div className="card">
              <h2>📦 Smart Reorder Recommendations</h2>
              <p style={{marginTop: '1rem', color: '#666'}}>Based on 12-week production + 4-week safety buffer:</p>
              <table style={{width: '100%', marginTop: '1rem', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #ddd', background: '#f8f9fa'}}>
                    <th style={{textAlign: 'left', padding: '0.75rem'}}>Product</th>
                    <th style={{textAlign: 'right', padding: '0.75rem'}}>Monthly Burn</th>
                    <th style={{textAlign: 'right', padding: '0.75rem'}}>Recommended Order</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '0.75rem'}}>Sour Watermelon</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>~5,288 units</td>
                    <td style={{textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#667eea'}}>84,614 units</td>
                  </tr>
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '0.75rem'}}>Sour Peach</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>~3,504 units</td>
                    <td style={{textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#667eea'}}>56,069 units</td>
                  </tr>
                  <tr>
                    <td style={{padding: '0.75rem'}}>Strawberry</td>
                    <td style={{textAlign: 'right', padding: '0.75rem'}}>~1,741 units</td>
                    <td style={{textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#667eea'}}>27,859 units</td>
                  </tr>
                </tbody>
              </table>
              <p style={{marginTop: '1.5rem', padding: '1rem', background: '#f0f4ff', borderLeft: '4px solid #667eea', borderRadius: '4px'}}>
                <strong>💡 Tip:</strong> Order now if current inventory will deplete within 14 weeks.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🍬 Cunnies Gummies Forecasting Dashboard</p>
      </footer>
    </div>
  );
}

export default App;
