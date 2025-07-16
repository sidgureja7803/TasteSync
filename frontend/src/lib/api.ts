import { config } from './config'

const API_BASE = config.api.baseUrl

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Research Tools (Tavily)
  static async searchContent(query: string, options?: {
    includeImages?: boolean
    includeRawContent?: boolean
    maxResults?: number
  }) {
    return this.request('/api/enhanced/search', {
      method: 'POST',
      body: JSON.stringify({ query, ...options }),
    })
  }

  static async getTrendingTopics(platform?: string) {
    return this.request('/api/enhanced/trending', {
      method: 'POST',
      body: JSON.stringify({ platform }),
    })
  }

  static async verifyContent(content: string) {
    return this.request('/api/enhanced/verify', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  static async researchTopic(topic: string, options?: {
    includeCompetitors?: boolean
    includeStats?: boolean
    maxResults?: number
  }) {
    return this.request('/api/enhanced/research', {
      method: 'POST',
      body: JSON.stringify({ topic, ...options }),
    })
  }

  // Memory Features (Mem0)
  static async getUserPreferences(userId: string) {
    return this.request(`/api/enhanced/preferences/${userId}`, {
      method: 'GET',
    })
  }

  static async updateUserPreferences(userId: string, preferences: any) {
    return this.request(`/api/enhanced/preferences/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  static async getPersonalizedRecommendations(userId: string, context?: any) {
    return this.request('/api/enhanced/recommendations', {
      method: 'POST',
      body: JSON.stringify({ userId, context }),
    })
  }

  static async getContentAnalytics(userId: string, timeRange?: string) {
    return this.request('/api/enhanced/analytics', {
      method: 'POST',
      body: JSON.stringify({ userId, timeRange }),
    })
  }

  static async submitFeedback(userId: string, feedback: any) {
    return this.request('/api/enhanced/feedback', {
      method: 'POST',
      body: JSON.stringify({ userId, ...feedback }),
    })
  }

  // Enhanced Content Generation
  static async generateEnhancedContent(request: {
    content: string
    platform: string
    tone: string
    userId: string
    useResearch?: boolean
    useMemory?: boolean
    customInstructions?: string
  }) {
    return this.request('/api/enhanced/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }
} 