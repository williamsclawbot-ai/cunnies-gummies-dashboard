import React, { useState, useEffect } from 'react';
import './App.css';
import SummaryCards from './components/SummaryCards';
import SalesChart from './components/SalesChart';
import ProductAnalysis from './components/ProductAnalysis';
import ForecastCard from './components/ForecastCard';
import ReorderTable from './components/ReorderTable';
import SupplyChainTracker from './components/SupplyChainTracker';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load dashboard data
    fetch('/api/dashboard_data.json')
      .then(res => res.json())
      .catch(() => {
        // Fallback to local data
        return import('./data/dashboard_data.json').then(m => m.default);
      })
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load data</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🍬 Cunnies Gummies</h1>
        <p>Sales Forecasting & Supply Chain Dashboard</p>
        <p className="last-updated">Updated: {new Date(data.summary.last_updated).toLocaleDateString()}</p>
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
            <SummaryCards data={data.summary} />
            
            <div className="grid grid-2">
              <div className="card">
                <h2>📈 Monthly Revenue Trend</h2>
                <SalesChart data={data.monthly_trends} />
              </div>
              
              <div className="card">
                <h2>🔮 Next Month Forecast</h2>
                <ForecastCard forecast={data.forecast} />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h2>🏆 Top Products</h2>
                <ProductAnalysis products={data.product_analysis} />
              </div>

              <div className="card">
                <h2>📦 Reorder Recommendations</h2>
                <ReorderTable recommendations={data.reorder_recommendations} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="card full-width">
              <h2>All Products Performance</h2>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Units Sold</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p, i) => {
                    const pct = (p.units_sold / data.summary.total_units_sold * 100).toFixed(1);
                    return (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.units_sold.toLocaleString()}</td>
                        <td>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{width: `${pct}%`}}
                            ></div>
                            <span>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="tab-content">
            <SupplyChainTracker recommendations={data.reorder_recommendations} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Last updated: {new Date(data.summary.last_updated).toLocaleString()}</p>
        <p>To refresh data: Export CSV from Shopify → Re-run dashboard builder</p>
      </footer>
    </div>
  );
}

export default App;
