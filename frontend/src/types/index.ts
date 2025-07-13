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