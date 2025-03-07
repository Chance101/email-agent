import base64
import email
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from backend.auth.gmail_auth import get_gmail_credentials

class GmailService:
    def __init__(self):
        self.service = self._build_service()
    
    def _build_service(self):
        """Build and return Gmail API service"""
        creds = get_gmail_credentials()
        return build('gmail', 'v1', credentials=creds)
    
    def get_messages(self, query=None, max_results=50):
        """Get messages matching the query"""
        query = query or ''
        results = self.service.users().messages().list(
            userId='me', q=query, maxResults=max_results
        ).execute()
        
        messages = results.get('messages', [])
        if not messages:
            return []
            
        return [self._get_message_detail(msg['id']) for msg in messages]
    
    def _get_message_detail(self, msg_id):
        """Get detailed message by ID"""
        message = self.service.users().messages().get(
            userId='me', id=msg_id, format='full'
        ).execute()
        
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), '')
        date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
        
        # Get body
        body = self._get_message_body(message['payload'])
        
        return {
            'id': msg_id,
            'threadId': message['threadId'],
            'snippet': message.get('snippet', ''),
            'subject': subject,
            'sender': sender,
            'date': date,
            'body': body,
            'labels': message.get('labelIds', [])
        }
    
    def _get_message_body(self, payload):
        """Extract message body from payload"""
        if 'body' in payload and payload['body'].get('data'):
            return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain' and part['body'].get('data'):
                    return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                if part['mimeType'] == 'text/html' and part['body'].get('data'):
                    return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
        
        return ""
    
    def modify_message(self, msg_id, add_labels=None, remove_labels=None):
        """Add or remove labels from a message"""
        body = {}
        if add_labels:
            body['addLabelIds'] = add_labels
        if remove_labels:
            body['removeLabelIds'] = remove_labels
            
        return self.service.users().messages().modify(
            userId='me', id=msg_id, body=body
        ).execute()
    
    def trash_message(self, msg_id):
        """Move a message to trash"""
        return self.service.users().messages().trash(userId='me', id=msg_id).execute()
    
    def untrash_message(self, msg_id):
        """Restore a message from trash"""
        return self.service.users().messages().untrash(userId='me', id=msg_id).execute()
    
    def draft_reply(self, msg_id, reply_body):
        """Create a draft reply to a message"""
        message = self.service.users().messages().get(
            userId='me', id=msg_id, format='metadata',
            metadataHeaders=['Subject', 'From', 'To', 'Message-ID', 'References', 'In-Reply-To']
        ).execute()
        
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), '')
        recipient = next((h['value'] for h in headers if h['name'] == 'To'), '')
        msg_id_header = next((h['value'] for h in headers if h['name'] == 'Message-ID'), '')
        
        # Create reply message
        reply = MIMEText(reply_body)
        reply['From'] = recipient
        reply['To'] = sender
        reply['Subject'] = f"Re: {subject}" if not subject.startswith('Re:') else subject
        reply['In-Reply-To'] = msg_id_header
        reply['References'] = msg_id_header
        
        encoded_message = base64.urlsafe_b64encode(reply.as_bytes()).decode()
        
        draft = {
            'message': {
                'raw': encoded_message,
                'threadId': message['threadId']
            }
        }
        
        return self.service.users().drafts().create(userId='me', body=draft).execute()