export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  credits: number
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  title: string
  content: string
  source: 'paste' | 'notion' | 'google-docs'
  sourceId?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface GeneratedContent {
  id: string
  documentId: string
  platform: 'twitter' | 'linkedin' | 'email'
  tone: string
  content: string
  metadata?: Record<string, any>
  tokensUsed: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface TokenUsage {
  id: string
  userId: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  operation: string
  createdAt: Date
}

export interface ToneConfig {
  name: string
  description: string
  platforms: {
    twitter: boolean
    linkedin: boolean
    email: boolean
  }
  examples: {
    twitter?: string
    linkedin?: string
    email?: string
  }
}

export interface PlatformContent {
  twitter?: {
    tweets: string[]
    thread: boolean
    hashtags: string[]
  }
  linkedin?: {
    post: string
    carousel?: string[]
    hashtags: string[]
  }
  email?: {
    subject: string
    body: string
    preheader?: string
  }
}

export interface ContentAnalysis {
  summary: string
  keyPoints: string[]
  tone: string
  targetAudience: string
  suggestedPlatforms: string[]
  topics: string[]
  sentiments: string[]
}

export interface ImportOptions {
  source: 'notion' | 'google-docs'
  url?: string
  documentId?: string
  accessToken?: string
}

export interface GenerationRequest {
  documentId: string
  platform: 'twitter' | 'linkedin' | 'email'
  tone: string
  customInstructions?: string
  targetAudience?: string
}

export interface AgentResponse {
  success: boolean
  data?: any
  error?: string
  tokensUsed?: number
}

// Research and Memory Types

export interface SearchResult {
  title: string
  content: string
  url: string
  publishedDate?: string
  score: number
  rawContent?: string
  images?: string[]
}

export interface TrendingTopic {
  topic: string
  volume: number
  growth: number
  platform: string
  relatedTerms: string[]
  insights: string[]
}

export interface ResearchResult {
  topic: string
  summary: string
  keyFindings: string[]
  sources: SearchResult[]
  competitors?: CompetitorAnalysis[]
  statistics?: Statistic[]
  opportunities: string[]
}

export interface CompetitorAnalysis {
  name: string
  approach: string
  strengths: string[]
  weaknesses: string[]
  content: string
}

export interface Statistic {
  metric: string
  value: string
  source: string
  date: string
}

export interface VerificationResult {
  isAccurate: boolean
  confidence: number
  sources: string[]
  corrections: string[]
  warnings: string[]
}

export interface UserPreferences {
  userId: string
  platforms: {
    twitter: boolean
    linkedin: boolean
    email: boolean
  }
  tones: string[]
  topics: string[]
  writingStyle: {
    length: 'short' | 'medium' | 'long'
    complexity: 'simple' | 'moderate' | 'complex'
    formality: 'casual' | 'professional' | 'formal'
  }
  contentTypes: string[]
  targetAudience: string
  timezone: string
  language: string
  preferences: Record<string, any>
}

export interface PersonalizedRecommendation {
  type: 'content' | 'tone' | 'platform' | 'timing'
  title: string
  description: string
  confidence: number
  reason: string
  data: any
}

export interface ContentAnalytics {
  userId: string
  timeRange: string
  totalContent: number
  platformBreakdown: Record<string, number>
  toneBreakdown: Record<string, number>
  engagement: {
    averageScore: number
    topPerforming: string[]
    improvement: string[]
  }
  trends: {
    topics: string[]
    growth: number[]
    opportunities: string[]
  }
  recommendations: PersonalizedRecommendation[]
}

export interface UserFeedback {
  userId: string
  contentId: string
  rating: number
  feedback: string
  category: 'quality' | 'accuracy' | 'relevance' | 'engagement'
  improvements: string[]
  timestamp: Date
}

export interface MemoryEntry {
  id: string
  userId: string
  type: 'preference' | 'pattern' | 'feedback' | 'conversation'
  content: string
  metadata: Record<string, any>
  importance: number
  createdAt: Date
  updatedAt: Date
}

export interface EnhancedGenerationRequest {
  content: string
  platform: string
  tone: string
  userId: string
  useResearch?: boolean
  useMemory?: boolean
  customInstructions?: string
  researchOptions?: {
    includeCompetitors?: boolean
    includeStats?: boolean
    maxResults?: number
  }
}

export interface EnhancedGenerationResponse {
  success: boolean
  content: string
  research?: ResearchResult
  personalization?: {
    appliedPreferences: string[]
    recommendations: PersonalizedRecommendation[]
  }
  verification?: VerificationResult
  metadata: {
    tokensUsed: number
    processingTime: number
    confidence: number
  }
} 