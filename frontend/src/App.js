import React, { useState } from 'react';
import './App.css';
import EmailList from './components/EmailList';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [filterMode, setFilterMode] = useState('important');
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled via state and passed to EmailList
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Intelligent Email Agent</h1>
        <nav className="app-nav">
          <button 
            className={activeTab === 'inbox' ? 'active' : ''} 
            onClick={() => setActiveTab('inbox')}
          >
            Inbox
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </header>
      
      {activeTab === 'inbox' && (
        <div className="inbox-container">
          <div className="inbox-toolbar">
            <div className="filter-buttons">
              <button 
                className={filterMode === 'important' ? 'active' : ''} 
                onClick={() => setFilterMode('important')}
              >
                Important
              </button>
              <button 
                className={filterMode === 'all' ? 'active' : ''} 
                onClick={() => setFilterMode('all')}
              >
                All
              </button>
              <button 
                className={filterMode === 'unread' ? 'active' : ''} 
                onClick={() => setFilterMode('unread')}
              >
                Unread
              </button>
            </div>
            
            <form className="search-form" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search emails..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
          
          <EmailList filterMode={filterMode} searchQuery={searchQuery} />
        </div>
      )}
      
      {activeTab === 'settings' && (
        <Settings />
      )}
    </div>
  );
}

export default App;