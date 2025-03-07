from flask import Blueprint, request, jsonify
from ..services.gmail_service import GmailService
from ..services.email_classifier import EmailClassifier
import json
import os
from pathlib import Path

api = Blueprint('api', __name__)
gmail_service = GmailService()
email_classifier = EmailClassifier()

@api.route('/emails', methods=['GET'])
def get_emails():
    """Get emails with optional filtering"""
    query = request.args.get('query', '')
    max_results = int(request.args.get('max_results', 50))
    filter_mode = request.args.get('filter', 'important')  # 'all', 'important', 'unread'
    
    # Construct Gmail query
    gmail_query = query
    
    if filter_mode == 'important':
        gmail_query += ' -category:promotions -category:social'
    elif filter_mode == 'unread':
        gmail_query += ' is:unread'
    
    # Get raw emails from Gmail
    emails = gmail_service.get_messages(query=gmail_query, max_results=max_results)
    
    # Apply our intelligent filtering
    if filter_mode == 'important':
        filtered_emails = []
        for email in emails:
            classification = email_classifier.classify_email(email)
            email['classification'] = classification
            if classification['show_to_user']:
                filtered_emails.append(email)
        
        return jsonify(filtered_emails)
    
    # Add classification but don't filter
    for email in emails:
        email['classification'] = email_classifier.classify_email(email)
    
    return jsonify(emails)

@api.route('/email/<email_id>', methods=['GET'])
def get_email(email_id):
    """Get a specific email by ID"""
    email = gmail_service.get_messages(query=f'id:{email_id}', max_results=1)
    if not email:
        return jsonify({'error': 'Email not found'}), 404
        
    email = email[0]
    email['classification'] = email_classifier.classify_email(email)
    return jsonify(email)

@api.route('/email/<email_id>/trash', methods=['POST'])
def trash_email(email_id):
    """Move an email to trash"""
    result = gmail_service.trash_message(email_id)
    return jsonify({'success': True, 'message': 'Email moved to trash'})

@api.route('/email/<email_id>/archive', methods=['POST'])
def archive_email(email_id):
    """Archive an email"""
    result = gmail_service.modify_message(
        email_id, 
        remove_labels=['INBOX']
    )
    return jsonify({'success': True, 'message': 'Email archived'})

@api.route('/email/<email_id>/mark_read', methods=['POST'])
def mark_read(email_id):
    """Mark email as read"""
    result = gmail_service.modify_message(
        email_id, 
        remove_labels=['UNREAD']
    )
    return jsonify({'success': True, 'message': 'Email marked as read'})

@api.route('/email/<email_id>/draft_reply', methods=['GET'])
def get_draft_reply(email_id):
    """Generate a draft reply for an email"""
    email = gmail_service.get_messages(query=f'id:{email_id}', max_results=1)
    if not email:
        return jsonify({'error': 'Email not found'}), 404
        
    email = email[0]
    draft = email_classifier.generate_reply_draft(email)
    return jsonify({'draft': draft})

@api.route('/email/<email_id>/send_reply', methods=['POST'])
def send_reply(email_id):
    """Send a reply to an email"""
    data = request.get_json()
    reply_body = data.get('reply', '')
    
    if not reply_body:
        return jsonify({'error': 'Reply body is required'}), 400
        
    # Create draft
    draft = gmail_service.draft_reply(email_id, reply_body)
    # TODO: implement sending the draft
    
    return jsonify({'success': True, 'message': 'Reply draft created'})

@api.route('/preferences', methods=['GET'])
def get_preferences():
    """Get user preferences"""
    return jsonify(email_classifier.preferences)

@api.route('/preferences', methods=['POST'])
def update_preferences():
    """Update user preferences"""
    data = request.get_json()
    
    # Validate incoming data
    valid_keys = [
        'important_senders',
        'blocked_senders',
        'keywords',
        'auto_archive_patterns',
        'show_promotional',
        'minimum_importance_score',
        'enable_llm_classification'
    ]
    
    for key, value in data.items():
        if key in valid_keys:
            email_classifier.preferences[key] = value
    
    # Save updated preferences
    email_classifier.save_user_preferences()
    
    return jsonify({
        'success': True, 
        'message': 'Preferences updated',
        'preferences': email_classifier.preferences
    })

@api.route('/contacts', methods=['GET'])
def get_contacts():
    """Get a list of frequent contacts"""
    # This would ideally use Google People API
    # For now, we'll just return a stub
    return jsonify([
        {'email': 'contact1@example.com', 'name': 'Contact One'},
        {'email': 'contact2@example.com', 'name': 'Contact Two'},
    ])