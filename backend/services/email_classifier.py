import re
import json
import os
from pathlib import Path
import openai

# Load user rules and preferences
class EmailClassifier:
    def __init__(self):
        self.config_path = Path('config/user_preferences.json')
        self.load_user_preferences()
        self.api_key = os.environ.get('OPENAI_API_KEY')
        
    def load_user_preferences(self):
        """Load user preferences from config file"""
        if self.config_path.exists():
            with open(self.config_path, 'r') as f:
                self.preferences = json.load(f)
        else:
            # Default preferences
            self.preferences = {
                'important_senders': [],
                'blocked_senders': [],
                'keywords': {
                    'important': [],
                    'spam': []
                },
                'auto_archive_patterns': [],
                'show_promotional': False,
                'minimum_importance_score': 0.6,
                'enable_llm_classification': True
            }
            self.save_user_preferences()
    
    def save_user_preferences(self):
        """Save user preferences to config file"""
        with open(self.config_path, 'w') as f:
            json.dump(self.preferences, f, indent=2)
    
    def classify_email(self, email_data):
        """Classify an email based on user preferences and ML model"""
        importance_score = 0.0
        
        # Check sender
        sender = email_data.get('sender', '')
        if any(important in sender.lower() for important in self.preferences['important_senders']):
            importance_score += 0.4
        
        if any(blocked in sender.lower() for blocked in self.preferences['blocked_senders']):
            return {
                'show_to_user': False,
                'importance_score': 0,
                'action': 'delete',
                'requires_response': False
            }
        
        # Check subject and body for keywords
        subject = email_data.get('subject', '')
        body = email_data.get('body', '')
        content = f"{subject} {body}"
        
        # Check important keywords
        if any(keyword.lower() in content.lower() for keyword in self.preferences['keywords']['important']):
            importance_score += 0.3
        
        # Check spam keywords
        if any(keyword.lower() in content.lower() for keyword in self.preferences['keywords']['spam']):
            importance_score -= 0.3
        
        # Check for promotional content
        if 'CATEGORY_PROMOTIONS' in email_data.get('labels', []) and not self.preferences['show_promotional']:
            importance_score -= 0.2
        
        # Check for auto-archive patterns
        for pattern in self.preferences['auto_archive_patterns']:
            if re.search(pattern, content, re.IGNORECASE):
                return {
                    'show_to_user': False,
                    'importance_score': importance_score,
                    'action': 'archive',
                    'requires_response': False
                }
        
        # Use LLM to improve classification if enabled
        if self.preferences['enable_llm_classification'] and self.api_key:
            llm_result = self.classify_with_llm(email_data)
            if llm_result:
                importance_score = (importance_score + llm_result['importance_score']) / 2
                requires_response = llm_result.get('requires_response', False)
            else:
                requires_response = self._simple_response_check(content)
        else:
            requires_response = self._simple_response_check(content)
        
        # Determine if email should be shown to user
        show_to_user = importance_score >= self.preferences['minimum_importance_score']
        
        # Suggested action based on classification
        if importance_score < 0.3:
            action = 'delete'
        elif importance_score < self.preferences['minimum_importance_score']:
            action = 'archive'
        else:
            action = 'show'
        
        return {
            'show_to_user': show_to_user,
            'importance_score': importance_score,
            'action': action,
            'requires_response': requires_response
        }
    
    def _simple_response_check(self, content):
        """Simple check for text suggesting a response is needed"""
        response_indicators = [
            "please respond",
            "let me know",
            "what do you think",
            "your thoughts",
            "can you provide",
            "waiting for your",
            "?",
            "please reply"
        ]
        return any(indicator.lower() in content.lower() for indicator in response_indicators)
    
    def classify_with_llm(self, email_data):
        """Use LLM to classify email importance and suggest actions"""
        try:
            openai.api_key = self.api_key
            
            prompt = f"""
            Analyze this email and determine:
            1. Importance score (0.0-1.0)
            2. If it requires a response
            3. Suggested action (show, archive, delete)
            
            Subject: {email_data.get('subject', '')}
            From: {email_data.get('sender', '')}
            Body:
            {email_data.get('body', '')[:1000]}...
            
            Return only a JSON object with importance_score, requires_response, and action keys.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You are an email classification assistant."},
                         {"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=150
            )
            
            try:
                result = json.loads(response.choices[0].message.content)
                return result
            except (ValueError, KeyError):
                return None
                
        except Exception as e:
            print(f"Error using LLM for classification: {e}")
            return None
            
    def generate_reply_draft(self, email_data):
        """Generate a draft reply based on email content"""
        if not self.api_key:
            return "I apologize, but I need to respond to your message later."
            
        try:
            openai.api_key = self.api_key
            
            prompt = f"""
            Write a professional email reply to the following message.
            Be concise, friendly, and address all questions or requests in the email.
            
            Original Email:
            From: {email_data.get('sender', '')}
            Subject: {email_data.get('subject', '')}
            
            {email_data.get('body', '')[:1500]}
            
            Reply:
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You are a helpful email assistant."},
                         {"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
                
        except Exception as e:
            print(f"Error generating reply draft: {e}")
            return "I apologize, but I need to respond to your message later."