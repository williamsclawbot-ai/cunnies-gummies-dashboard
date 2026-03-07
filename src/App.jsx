import React, { useState } from 'react';
import './App.css';
import MyFeedPage from './components/MyFeedPage';
import KanbanPage from './components/KanbanPage';

function App() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="app">
      <header className="header">
        <h1>John.os</h1>
        <p>Personal AI Dashboard</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          AI Feed
        </button>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'feed' && <MyFeedPage />}
        {activeTab === 'tasks' && <KanbanPage />}
      </main>

      <footer className="footer">
        <p>John.os</p>
      </footer>
    </div>
  );
}

export default App;
