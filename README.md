# Intelligent Email Agent

A smart email management system that helps you focus on what matters in your Gmail inbox. The agent intelligently filters, categorizes, and prioritizes emails based on your preferences and learns from your behavior over time.

## Features

- **Smart Email Filtering**: Only see emails that matter to you based on customizable importance criteria
- **Auto-categorization**: Automatically categorizes emails as important, needs response, can be archived, etc.
- **AI Response Generation**: Drafts responses to emails for your review and approval
- **Unsubscribe Handling**: Identifies and helps you unsubscribe from unwanted mailing lists
- **Customizable Rules**: Set your own rules for what's important and what can be deleted or archived
- **Gmail Integration**: Works with your existing Gmail account

## Security

This application prioritizes the security of your email data:

- Uses OAuth2 for secure authentication with Gmail
- All email processing happens locally on your machine
- No email content is stored on any external servers
- API keys and tokens are stored securely in your local config
- LLM-based classification is optional and can be disabled

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn
- Gmail account
- Google Cloud Platform account (for API access)

### Setup Google API Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Desktop application)
5. Download the credentials JSON file and save it as `config/credentials.json` in the project directory

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/email-agent.git
   cd email-agent
   ```

2. Set up environment variables:
   Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_api_key  # Optional, for AI classification
   ```

3. Install dependencies:
   ```
   npm run install-all
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. The first time you run the app, you'll be prompted to authenticate with Google

## Usage

### Main Inbox View

- See your prioritized emails
- Filter by importance, unread status, or view all emails
- Search for specific emails
- Archive, delete, or draft replies to emails

### Settings

- Add important senders to always see their emails
- Block senders to automatically delete their emails
- Set important keywords to prioritize emails containing them
- Set spam keywords to deprioritize emails containing them
- Configure auto-archive patterns using regex
- Adjust the minimum importance score threshold
- Toggle promotional email visibility
- Enable/disable AI-powered email classification

## Implementation Details

- Backend: Python with Flask
- Frontend: React
- Email access: Gmail API with OAuth2
- Classification: Rule-based + optional OpenAI GPT integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gmail API
- OpenAI for the classification functionality