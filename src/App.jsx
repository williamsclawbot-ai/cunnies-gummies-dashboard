import React, { useState } from 'react';
import './App.css';
import SummaryCards from './components/SummaryCards';
import SalesChart from './components/SalesChart';
import ProductAnalysis from './components/ProductAnalysis';
import ForecastCard from './components/ForecastCard';
import ReorderTable from './components/ReorderTable';
import SupplyChainTracker from './components/SupplyChainTracker';

// Sample data - replace with actual data
const sampleData = {
  summary: {
    last_updated: new Date().toISOString(),
    total_revenue_all_time: 3424280,
    total_orders_all_time: 40641,
    total_units_sold: 58769.5,
    active_months: 6,
    average_monthly_revenue: 570713
  },
  monthly_trends: [],
  forecast: {
    projected_orders: 8413,
    projected_aov: "$83.94",
    projected_revenue: "$706,201",
    confidence: "70%"
  },
  products: [],
  product_analysis: [],
  reorder_recommendations: []
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const data = sampleData;
  return (
    <div className="app">
      <header className="header">
        <h1>🍬 Cunnies Gummies</h1>
        <p>Sales Forecasting & Supply Chain Dashboard</p>
      </header>

      <nav className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🏆 Products</button>
        <button className={`tab ${activeTab === 'supply' ? 'active' : ''}`} onClick={() => setActiveTab('supply')}>📦 Supply Chain</button>
      </nav>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <SummaryCards data={data.summary} />
            <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
              <p>Dashboard is loading...</p>
              <p>Data file: public/api/dashboard_data.json</p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Cunnies Gummies Forecasting Dashboard</p>
      </footer>
    </div>
  );
}

export default App;
