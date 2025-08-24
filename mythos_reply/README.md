# MythosReply - AI-Powered Twitter Reply Agent

A sophisticated Twitter reply automation system built with Next.js and TypeScript that allows multiple users to manage automated responses across multiple Twitter accounts. Features intelligent AI-powered reply generation using free OpenRouter models.

## 🚀 Features

### Core Functionality
- **Multi-User Support**: Multiple users can register and manage their own Twitter accounts
- **Twitter API Integration**: Full integration with Twitter API v2 for posting and monitoring
- **Multi-Account Management**: Each user can connect multiple Twitter accounts
- **Automated Reply Jobs**: Create jobs to automatically reply to specific tweets, users, or keywords

### AI-Powered Responses
- **Free AI Models**: Integration with OpenRouter's free models including:
  - Google Gemma 2 (9B and 2B variants)
  - Microsoft Phi-3 Mini
  - Qwen 2 7B
- **Customizable Tones**: Professional, casual, humorous, supportive, promotional
- **Smart Features**: Optional hashtags, emojis, and custom instructions
- **Multiple Variations**: Generate multiple reply options for each target

### Advanced Features
- **Keyword Monitoring**: Monitor Twitter for specific keywords and auto-reply
- **User Monitoring**: Track specific users and reply to their tweets
- **Rate Limiting**: Built-in delays to respect Twitter API limits
- **Analytics**: Track reply success rates and performance
- **Real-time Dashboard**: Modern web interface for managing all operations

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI Integration**: OpenRouter API with multiple free models
- **Authentication**: JWT-based auth system
- **Twitter API**: OAuth 1.0a integration
- **Documentation**: Swagger/OpenAPI 3.0

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Twitter Developer Account with API keys
- OpenRouter API key (free)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MythosReply
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

   Configure the following variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/mythos_reply"

   # Twitter API Credentials
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to access the application.

## 🔑 API Keys Setup

### Twitter API Setup
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Generate API keys and tokens
4. Ensure your app has read and write permissions
5. For user authentication, set up OAuth 1.0a callback URLs

### OpenRouter Setup
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Generate an API key
4. All models listed in the app are completely free to use!

## 📚 API Documentation

Interactive API documentation is available at `/docs` when running the application. The documentation includes:

- Complete endpoint reference
- Request/response examples
- Authentication details
- Model schemas
- Try-it-out functionality

## 🤖 AI Models Available

All models are **completely free** via OpenRouter:

| Model | Provider | Description |
|-------|----------|-------------|
| Gemma 2 9B | Google | Efficient conversational model |
| Phi-3 Mini | Microsoft | Compact but capable model |
| Gemma 2 2B | Google | Lightweight for quick responses |
| Qwen 2 7B | Alibaba | Multilingual instruction-following |

## 🔄 Usage Flow

1. **Register/Login**: Create an account or login
2. **Connect Twitter**: Add your Twitter account credentials
3. **Create Reply Job**: Set up automated reply rules with options for:
   - Target specific tweets by ID
   - Monitor specific users
   - Watch for keywords
   - Enable AI-powered responses
4. **Monitor Dashboard**: Track performance and manage jobs
5. **AI Playground**: Test and refine AI-generated responses

## 🏗️ Architecture

### Frontend Components
- **Authentication Pages**: Login, register, password reset
- **Dashboard**: Overview of accounts, jobs, and statistics
- **Account Management**: Connect and manage Twitter accounts
- **Job Creation**: Create and configure reply jobs
- **AI Playground**: Test AI reply generation

### Backend Services
- **AuthService**: User authentication and JWT management
- **TwitterService**: Twitter API integration and OAuth
- **OpenRouterService**: AI model integration and reply generation
- **ReplyAgentService**: Core automation logic and job processing

### Database Schema
- **Users**: Account management
- **TwitterAccounts**: Connected Twitter credentials
- **ReplyJobs**: Automation job configurations
- **Replies**: History and analytics

## 🔐 Security Features

- JWT-based authentication
- Secure credential storage
- API rate limiting
- Input validation and sanitization
- CORS protection
- Environment variable security

## 🚦 Rate Limiting

Built-in protections to respect API limits:
- 5-second delays between replies
- 2-second delays between processing jobs
- Configurable maximum replies per job
- Twitter API rate limit compliance

## 📊 Monitoring & Analytics

- Real-time job status tracking
- Reply success/failure rates
- Performance metrics dashboard
- Error logging and reporting
- Usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the issue tracker
- Join our community discussions

## 🎯 Roadmap

- [ ] Scheduled reply jobs
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Bulk operations
- [ ] Advanced AI customization
- [ ] Mobile app support

---

**Note**: This application uses free AI models via OpenRouter and respects Twitter's API terms of service. Always ensure compliance with platform policies when using automation tools.

For the latest information about free models available on OpenRouter, visit: [https://openrouter.ai/models?fmt=table&q=free](https://openrouter.ai/models?fmt=table&q=free)
