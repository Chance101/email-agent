import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmailList.css';

function EmailList({ filterMode, searchQuery }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [draftReply, setDraftReply] = useState('');
  
  useEffect(() => {
    fetchEmails();
  }, [filterMode, searchQuery]);
  
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/emails', {
        params: {
          filter: filterMode,
          query: searchQuery,
          max_results: 50
        }
      });
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailClick = async (emailId) => {
    try {
      const response = await axios.get(`/api/email/${emailId}`);
      setSelectedEmail(response.data);
      
      // Mark as read
      await axios.post(`/api/email/${emailId}/mark_read`);
    } catch (error) {
      console.error('Error fetching email details:', error);
    }
  };
  
  const handleTrash = async (emailId, e) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/email/${emailId}/trash`);
      setEmails(emails.filter(email => email.id !== emailId));
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error trashing email:', error);
    }
  };
  
  const handleArchive = async (emailId, e) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/email/${emailId}/archive`);
      setEmails(emails.filter(email => email.id !== emailId));
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error archiving email:', error);
    }
  };
  
  const generateReplyDraft = async (emailId) => {
    try {
      const response = await axios.get(`/api/email/${emailId}/draft_reply`);
      setDraftReply(response.data.draft);
    } catch (error) {
      console.error('Error generating reply draft:', error);
    }
  };
  
  const sendReply = async (emailId) => {
    try {
      await axios.post(`/api/email/${emailId}/send_reply`, {
        reply: draftReply
      });
      setDraftReply('');
      alert('Reply draft created');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading emails...</div>;
  }
  
  return (
    <div className="email-container">
      <div className="email-list">
        <h2>{filterMode === 'important' ? 'Important' : filterMode === 'unread' ? 'Unread' : 'All'} Emails</h2>
        {emails.length === 0 ? (
          <div className="no-emails">No emails found.</div>
        ) : (
          emails.map(email => (
            <div 
              key={email.id} 
              className={`email-item ${selectedEmail && selectedEmail.id === email.id ? 'selected' : ''}`}
              onClick={() => handleEmailClick(email.id)}
            >
              <div className="email-header">
                <div className="email-sender">{email.sender.split('<')[0].trim()}</div>
                <div className="email-date">{new Date(email.date).toLocaleDateString()}</div>
              </div>
              <div className="email-subject">{email.subject}</div>
              <div className="email-snippet">{email.snippet}</div>
              <div className="email-actions">
                <button onClick={(e) => handleArchive(email.id, e)}>Archive</button>
                <button onClick={(e) => handleTrash(email.id, e)}>Delete</button>
                {email.classification.requires_response && (
                  <span className="response-needed">Response needed</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {selectedEmail && (
        <div className="email-detail">
          <div className="email-detail-header">
            <h3>{selectedEmail.subject}</h3>
            <div>From: {selectedEmail.sender}</div>
            <div>Date: {new Date(selectedEmail.date).toLocaleString()}</div>
          </div>
          
          <div className="email-detail-body" 
               dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
          
          <div className="email-detail-actions">
            <button onClick={() => handleArchive(selectedEmail.id, { stopPropagation: () => {} })}>
              Archive
            </button>
            <button onClick={() => handleTrash(selectedEmail.id, { stopPropagation: () => {} })}>
              Delete
            </button>
            <button onClick={() => generateReplyDraft(selectedEmail.id)}>
              Generate Reply
            </button>
          </div>
          
          {draftReply && (
            <div className="email-reply">
              <textarea 
                value={draftReply}
                onChange={(e) => setDraftReply(e.target.value)}
                rows={6}
              />
              <button onClick={() => sendReply(selectedEmail.id)}>Send Reply</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmailList;