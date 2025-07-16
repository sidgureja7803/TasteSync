import { useState, useCallback, useEffect } from 'react'
import { ApiService } from '../lib/api'
import type { UserPreferences, PersonalizedRecommendation, ContentAnalytics, UserFeedback } from '../types'

interface UseMemoryReturn {
  preferences: UserPreferences | null
  recommendations: PersonalizedRecommendation[]
  analytics: ContentAnalytics | null
  loading: boolean
  error: string | null
  loadPreferences: (userId: string) => Promise<void>
  updatePreferences: (userId: string, preferences: Partial<UserPreferences>) => Promise<void>
  getRecommendations: (userId: string, context?: any) => Promise<void>
  getAnalytics: (userId: string, timeRange?: string) => Promise<void>
  submitFeedback: (userId: string, feedback: UserFeedback) => Promise<void>
  clearData: () => void
}

export const useMemory = (): UseMemoryReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPreferences = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.getUserPreferences(userId) as any
      setPreferences(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePreferences = useCallback(async (userId: string, preferences: Partial<UserPreferences>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.updateUserPreferences(userId, preferences) as any
      setPreferences(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }, [])

  const getRecommendations = useCallback(async (userId: string, context?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.getPersonalizedRecommendations(userId, context) as any
      setRecommendations(response.data?.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations')
    } finally {
      setLoading(false)
    }
  }, [])

  const getAnalytics = useCallback(async (userId: string, timeRange?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ApiService.getContentAnalytics(userId, timeRange) as any
      setAnalytics(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitFeedback = useCallback(async (userId: string, feedback: UserFeedback) => {
    setLoading(true)
    setError(null)
    try {
      await ApiService.submitFeedback(userId, feedback)
      // Refresh recommendations after feedback
      await getRecommendations(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }, [getRecommendations])

  const clearData = useCallback(() => {
    setPreferences(null)
    setRecommendations([])
    setAnalytics(null)
    setError(null)
  }, [])

  return {
    preferences,
    recommendations,
    analytics,
    loading,
    error,
    loadPreferences,
    updatePreferences,
    getRecommendations,
    getAnalytics,
    submitFeedback,
    clearData,
  }
} 