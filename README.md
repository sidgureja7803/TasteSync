# TasteSync

Transform long-form content into audience-personalized social media content using AI.

## 🚀 Features

- **Content Import**: Import from Notion, Google Docs, or paste directly
- **AI-Powered Analysis**: Extract key insights using DeepSeek-V3
- **Multi-Platform Generation**: Create content for Twitter, LinkedIn, and Email
- **Smart Tone Matching**: 16+ tones with platform-specific presets
- **Real-time Editor**: AI markdown editor with live preview
- **Token Management**: Real-time usage tracking and credits
- **Content History**: Version control and search functionality

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
# Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Configure your environment variables:
   - Set up Clerk authentication keys
   - Configure PostgreSQL connection
   - Add Together AI API key
   - Set up Notion/Google Docs API keys

5. Run database migrations:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

6. Start development servers:
```bash
npm run dev
```

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 