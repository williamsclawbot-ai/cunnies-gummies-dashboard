import React, { useState } from 'react';
import './App.css';
import DashboardOverview from './components/DashboardOverview';
import ProductsPage from './components/ProductsPage';
import SupplyChainPage from './components/SupplyChainPage';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app">
      <header className="header">
        <h1>🍬 Cunnies Gummies</h1>
        <p>Sales Analytics & Supply Chain Dashboard</p>
        <div className="last-updated">Last updated: {new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })}</div>
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
            <DashboardOverview />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="tab-content">
            <ProductsPage />
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="tab-content">
            <SupplyChainPage />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🍬 Cunnies Gummies Forecasting Dashboard v2.0</p>
        <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
          Mock data for testing. Shopify API integration available.
        </p>
      </footer>
    </div>
  );
}

export default App;
