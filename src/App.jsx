import React, { useState, useEffect } from 'react';
import './App.css';
import SummaryCards from './components/SummaryCards';
import ProductAnalysis from './components/ProductAnalysis';
import SupplyChainTracker from './components/SupplyChainTracker';
import ReorderTable from './components/ReorderTable';
import ForecastCard from './components/ForecastCard';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try to load from the API data location
        const response = await fetch('/api/dashboard_data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <h1>🍬 Cunnies Gummies</h1>
          <p>Sales Forecasting & Supply Chain Dashboard</p>
        </header>
        <main className="main-content">
          <div className="loading">Loading dashboard data...</div>
        </main>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="app">
        <header className="header">
          <h1>🍬 Cunnies Gummies</h1>
          <p>Sales Forecasting & Supply Chain Dashboard</p>
        </header>
        <main className="main-content">
          <div className="error-message">
            <p>⚠️ Error loading data: {error || 'No data available'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🍬 Cunnies Gummies</h1>
        <p>Sales Forecasting & Supply Chain Dashboard</p>
        <div className="last-updated">Last updated: {new Date(dashboardData.summary.last_updated).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })}</div>
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
            <SummaryCards data={dashboardData} />
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>📈 Forecast</h3>
              <ForecastCard forecast={dashboardData.forecast} />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="tab-content">
            <ProductAnalysis 
              products={dashboardData.products} 
              monthlyData={dashboardData.monthly_trends}
            />
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="tab-content">
            <SupplyChainTracker supplyChain={dashboardData.supply_chain} />
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3>💡 Reorder Recommendations</h3>
              <ReorderTable recommendations={dashboardData.reorder_recommendations} />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🍬 Cunnies Gummies Forecasting Dashboard</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Last updated: {new Date(dashboardData.summary.last_updated).toLocaleDateString('en-AU')}
        </p>
      </footer>
    </div>
  );
}

export default App;
