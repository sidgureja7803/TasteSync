import { useState, useCallback } from 'react'
import { ApiService } from '../lib/api'
import type { SearchResult, TrendingTopic, ResearchResult, VerificationResult } from '../types'

interface UseResearchReturn {
  searchResults: SearchResult[]
  trendingTopics: TrendingTopic[]
  researchData: ResearchResult | null
  verificationResult: VerificationResult | null
  loading: boolean
  error: string | null
  searchContent: (query: string, options?: any) => Promise<void>
  getTrendingTopics: (platform?: string) => Promise<void>
  researchTopic: (topic: string, options?: any) => Promise<void>
  verifyContent: (content: string) => Promise<void>
  clearResults: () => void
}

export const useResearch = (): UseResearchReturn => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [researchData, setResearchData] = useState<ResearchResult | null>(null)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchContent = useCallback(async (query: string, options?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.searchContent(query, options) as any
      setSearchResults(response.data?.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const getTrendingTopics = useCallback(async (platform?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.getTrendingTopics(platform) as any
      setTrendingTopics(response.data?.topics || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get trending topics')
    } finally {
      setLoading(false)
    }
  }, [])

  const researchTopic = useCallback(async (topic: string, options?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.researchTopic(topic, options) as any
      setResearchData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyContent = useCallback(async (content: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.verifyContent(content) as any
      setVerificationResult(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setSearchResults([])
    setTrendingTopics([])
    setResearchData(null)
    setVerificationResult(null)
    setError(null)
  }, [])

  return {
    searchResults,
    trendingTopics,
    researchData,
    verificationResult,
    loading,
    error,
    searchContent,
    getTrendingTopics,
    researchTopic,
    verifyContent,
    clearResults,
  }
} 