import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

function Settings() {
  const [preferences, setPreferences] = useState({
    important_senders: [],
    blocked_senders: [],
    keywords: {
      important: [],
      spam: []
    },
    auto_archive_patterns: [],
    show_promotional: false,
    minimum_importance_score: 0.6,
    enable_llm_classification: true
  });
  
  const [loading, setLoading] = useState(true);
  const [newImportantSender, setNewImportantSender] = useState('');
  const [newBlockedSender, setNewBlockedSender] = useState('');
  const [newImportantKeyword, setNewImportantKeyword] = useState('');
  const [newSpamKeyword, setNewSpamKeyword] = useState('');
  const [newArchivePattern, setNewArchivePattern] = useState('');
  
  useEffect(() => {
    fetchPreferences();
  }, []);
  
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const savePreferences = async () => {
    try {
      await axios.post('/api/preferences', preferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences.');
    }
  };
  
  const addImportantSender = () => {
    if (newImportantSender && !preferences.important_senders.includes(newImportantSender)) {
      setPreferences({
        ...preferences,
        important_senders: [...preferences.important_senders, newImportantSender]
      });
      setNewImportantSender('');
    }
  };
  
  const removeImportantSender = (sender) => {
    setPreferences({
      ...preferences,
      important_senders: preferences.important_senders.filter(s => s !== sender)
    });
  };
  
  const addBlockedSender = () => {
    if (newBlockedSender && !preferences.blocked_senders.includes(newBlockedSender)) {
      setPreferences({
        ...preferences,
        blocked_senders: [...preferences.blocked_senders, newBlockedSender]
      });
      setNewBlockedSender('');
    }
  };
  
  const removeBlockedSender = (sender) => {
    setPreferences({
      ...preferences,
      blocked_senders: preferences.blocked_senders.filter(s => s !== sender)
    });
  };
  
  const addImportantKeyword = () => {
    if (newImportantKeyword && !preferences.keywords.important.includes(newImportantKeyword)) {
      setPreferences({
        ...preferences,
        keywords: {
          ...preferences.keywords,
          important: [...preferences.keywords.important, newImportantKeyword]
        }
      });
      setNewImportantKeyword('');
    }
  };
  
  const removeImportantKeyword = (keyword) => {
    setPreferences({
      ...preferences,
      keywords: {
        ...preferences.keywords,
        important: preferences.keywords.important.filter(k => k !== keyword)
      }
    });
  };
  
  const addSpamKeyword = () => {
    if (newSpamKeyword && !preferences.keywords.spam.includes(newSpamKeyword)) {
      setPreferences({
        ...preferences,
        keywords: {
          ...preferences.keywords,
          spam: [...preferences.keywords.spam, newSpamKeyword]
        }
      });
      setNewSpamKeyword('');
    }
  };
  
  const removeSpamKeyword = (keyword) => {
    setPreferences({
      ...preferences,
      keywords: {
        ...preferences.keywords,
        spam: preferences.keywords.spam.filter(k => k !== keyword)
      }
    });
  };
  
  const addArchivePattern = () => {
    if (newArchivePattern && !preferences.auto_archive_patterns.includes(newArchivePattern)) {
      setPreferences({
        ...preferences,
        auto_archive_patterns: [...preferences.auto_archive_patterns, newArchivePattern]
      });
      setNewArchivePattern('');
    }
  };
  
  const removeArchivePattern = (pattern) => {
    setPreferences({
      ...preferences,
      auto_archive_patterns: preferences.auto_archive_patterns.filter(p => p !== pattern)
    });
  };
  
  const handleImportanceScoreChange = (value) => {
    setPreferences({
      ...preferences,
      minimum_importance_score: parseFloat(value)
    });
  };
  
  const handlePromotionalChange = (checked) => {
    setPreferences({
      ...preferences,
      show_promotional: checked
    });
  };
  
  const handleLLMClassificationChange = (checked) => {
    setPreferences({
      ...preferences,
      enable_llm_classification: checked
    });
  };
  
  if (loading) {
    return <div className="loading">Loading preferences...</div>;
  }
  
  return (
    <div className="settings-container">
      <h2>Email Agent Settings</h2>
      
      <div className="settings-section">
        <h3>Important Senders</h3>
        <p>Emails from these addresses will always be shown</p>
        
        <div className="input-group">
          <input 
            type="text" 
            value={newImportantSender}
            onChange={(e) => setNewImportantSender(e.target.value)}
            placeholder="Email address"
          />
          <button onClick={addImportantSender}>Add</button>
        </div>
        
        <div className="tag-list">
          {preferences.important_senders.map(sender => (
            <div key={sender} className="tag">
              {sender}
              <button onClick={() => removeImportantSender(sender)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Blocked Senders</h3>
        <p>Emails from these addresses will be deleted</p>
        
        <div className="input-group">
          <input 
            type="text" 
            value={newBlockedSender}
            onChange={(e) => setNewBlockedSender(e.target.value)}
            placeholder="Email address"
          />
          <button onClick={addBlockedSender}>Add</button>
        </div>
        
        <div className="tag-list">
          {preferences.blocked_senders.map(sender => (
            <div key={sender} className="tag">
              {sender}
              <button onClick={() => removeBlockedSender(sender)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Important Keywords</h3>
        <p>Emails containing these words will be prioritized</p>
        
        <div className="input-group">
          <input 
            type="text" 
            value={newImportantKeyword}
            onChange={(e) => setNewImportantKeyword(e.target.value)}
            placeholder="Keyword"
          />
          <button onClick={addImportantKeyword}>Add</button>
        </div>
        
        <div className="tag-list">
          {preferences.keywords.important.map(keyword => (
            <div key={keyword} className="tag">
              {keyword}
              <button onClick={() => removeImportantKeyword(keyword)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Spam Keywords</h3>
        <p>Emails containing these words will be deprioritized</p>
        
        <div className="input-group">
          <input 
            type="text" 
            value={newSpamKeyword}
            onChange={(e) => setNewSpamKeyword(e.target.value)}
            placeholder="Keyword"
          />
          <button onClick={addSpamKeyword}>Add</button>
        </div>
        
        <div className="tag-list">
          {preferences.keywords.spam.map(keyword => (
            <div key={keyword} className="tag">
              {keyword}
              <button onClick={() => removeSpamKeyword(keyword)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Auto-Archive Patterns</h3>
        <p>Emails matching these regex patterns will be archived automatically</p>
        
        <div className="input-group">
          <input 
            type="text" 
            value={newArchivePattern}
            onChange={(e) => setNewArchivePattern(e.target.value)}
            placeholder="Regex pattern"
          />
          <button onClick={addArchivePattern}>Add</button>
        </div>
        
        <div className="tag-list">
          {preferences.auto_archive_patterns.map(pattern => (
            <div key={pattern} className="tag">
              {pattern}
              <button onClick={() => removeArchivePattern(pattern)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Advanced Settings</h3>
        
        <div className="setting-item">
          <label>Minimum Importance Score (0-1):</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={preferences.minimum_importance_score}
            onChange={(e) => handleImportanceScoreChange(e.target.value)}
          />
          <span>{preferences.minimum_importance_score}</span>
        </div>
        
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={preferences.show_promotional}
              onChange={(e) => handlePromotionalChange(e.target.checked)}
            />
            Show Promotional Emails
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={preferences.enable_llm_classification}
              onChange={(e) => handleLLMClassificationChange(e.target.checked)}
            />
            Enable AI Email Classification
          </label>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="save-button" onClick={savePreferences}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}

export default Settings;