# TasteSync

Transform long-form content into audience-personalized social media content using AI.

## 🚀 Features

### ✅ Currently Implemented
- **Content Import**: Import from Notion, Google Docs, or paste directly
- **AI-Powered Analysis**: Extract key insights using DeepSeek-V3
- **Multi-Platform Generation**: Create content for Twitter, LinkedIn, and Email
- **Smart Tone Matching**: 16+ tones with platform-specific presets
- **Token Management**: Real-time usage tracking and credits
- **Content History**: Version control and search functionality
- **Export Options**: Export content in multiple formats (Markdown, HTML, JSON, TXT)
- **Publishing**: Basic Dev.to publishing integration

### 🔄 In Development
- **Real-time Editor**: AI markdown editor with live preview
- **Dashboard UI**: Complete dashboard with sidebar and content workspace
- **Advanced Analytics**: Detailed performance tracking
- **Team Collaboration**: Multi-user workspace features

### 🔮 Coming Soon
- **Medium Publishing**: Direct publishing to Medium
- **LinkedIn Direct Post**: Automated LinkedIn posting
- **Twitter Auto-post**: Direct Twitter thread publishing
- **Advanced AI Models**: Support for more AI providers
- **Content Scheduling**: Plan and schedule posts
- **A/B Testing**: Test different content variations

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **UI**: Tailwind CSS + Shadcn UI
- **Auth**: Clerk OAuth (Google + GitHub)
- **State**: React Context + Local Storage
- **Deployment**: Vercel

### Backend (Node.js + Express + PostgreSQL)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk middleware
- **AI**: DeepSeek-V3 via Together AI
- **Deployment**: Railway/Render

### AI Agent Stack
- **ContentAnalystAgent**: Summarizes and extracts key information
- **PlatformRouterAgent**: Decides optimal content distribution
- **TwitterAgent**: Creates threads and tweets
- **LinkedInAgent**: Generates posts and carousels
- **EmailAgent**: Crafts subject lines and newsletter content

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tastesync.git
cd tastesync
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# For backend (required)
cp .env.example backend/.env

# For frontend (required)
# Copy only VITE_ variables to frontend/.env.local
echo "VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001" > frontend/.env.local
```

4. Configure your environment variables in `backend/.env`:
   - **Required**: `DATABASE_URL`, `CLERK_SECRET_KEY`, `TOGETHER_API_KEY`
   - **Optional**: `NOTION_API_KEY`, `GOOGLE_DOCS_API_KEY`, `DEVTO_API_KEY`

5. Set up the database:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

6. Start development servers:
```bash
# From root directory
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3001

## 📁 Project Structure

```
tastesync/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── agents/
│   └── package.json
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── agents/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
└── README.md
```

## 🔧 Environment Variables

### Frontend (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/tastesync"
CLERK_SECRET_KEY=your_clerk_secret_key
TOGETHER_API_KEY=your_together_api_key
NOTION_API_KEY=your_notion_api_key
GOOGLE_DOCS_API_KEY=your_google_docs_api_key
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
```

## 📊 API Endpoints

- `POST /api/import` - Import content from external sources
- `POST /api/analyze` - Analyze content with AI
- `POST /api/generate` - Generate platform-specific content
- `GET /api/tokens` - Get token usage statistics
- `POST /api/save` - Save content drafts
- `POST /api/publish` - Publish content to platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🚀 What's Next?

To continue developing TasteSync:

1. **Set up your environment** following the setup instructions above
2. **Configure APIs**: Get your Clerk, Together AI, and database credentials
3. **Start the development servers** and test the basic functionality
4. **Implement the dashboard UI** - this is the next major frontend component needed
5. **Add real-time features** like live preview and collaborative editing
6. **Enhance the AI agents** with more sophisticated prompts and error handling
7. **Add comprehensive testing** - unit tests, integration tests, and E2E tests
8. **Implement advanced features** like content scheduling and analytics

### Priority Tasks
- [ ] Build the main dashboard UI with sidebar and content workspace
- [ ] Create the AI markdown editor with live preview
- [ ] Add proper authentication flow with Clerk
- [ ] Implement content import from Notion and Google Docs
- [ ] Add comprehensive error handling and loading states
- [ ] Create user onboarding flow
- [ ] Add responsive design for mobile devices

### Technical Debt
- [ ] Add proper TypeScript types for all API responses
- [ ] Implement proper error boundaries in React
- [ ] Add input validation and sanitization
- [ ] Implement proper caching strategies
- [ ] Add comprehensive logging and monitoring
- [ ] Optimize database queries and add indexing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 