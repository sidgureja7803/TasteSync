import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMemory } from '@/hooks/useMemory'
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Star,
  ThumbsUp,
  Users,
  Activity,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react'

interface AnalyticsPanelProps {
  userId: string
  onClose?: () => void
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ userId, onClose }) => {
  const {
    analytics,
    recommendations,
    loading,
    error,
    getAnalytics,
    getRecommendations,
  } = useMemory()

  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    getAnalytics(userId, timeRange)
    getRecommendations(userId)
  }, [userId, timeRange, getAnalytics, getRecommendations])

  const handleRefresh = () => {
    getAnalytics(userId, timeRange)
    getRecommendations(userId)
  }

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ]

  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'content': return <Target className="w-4 h-4" />
      case 'tone': return <Star className="w-4 h-4" />
      case 'platform': return <Users className="w-4 h-4" />
      case 'timing': return <Calendar className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'content': return 'bg-blue-100 text-blue-800'
      case 'tone': return 'bg-purple-100 text-purple-800'
      case 'platform': return 'bg-green-100 text-green-800'
      case 'timing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Content Analytics
            </CardTitle>
            <CardDescription>
              Insights and performance metrics for your content
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges.map(range => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <X className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {analytics && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Content</p>
                      <p className="text-2xl font-bold">{analytics.totalContent}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                      <p className={`text-2xl font-bold ${getEngagementColor(analytics.engagement.averageScore)}`}>
                        {Math.round(analytics.engagement.averageScore * 100)}%
                      </p>
                    </div>
                    <ThumbsUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Growth Trend</p>
                      <p className="text-2xl font-bold text-green-600 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-1" />
                        {analytics.trends.growth?.[0] ? `+${Math.round(analytics.trends.growth[0] * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="capitalize font-medium">{platform}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{count} posts</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.totalContent) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tone Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tone Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.toneBreakdown).map(([tone, count]) => (
                    <div key={tone} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <span className="capitalize font-medium">{tone}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{count} posts</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.totalContent) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.engagement.topPerforming.map((content, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{content.substring(0, 100)}...</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs text-gray-500">Rank #{index + 1}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              High Performance
                            </span>
                          </div>
                        </div>
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analytics.trends.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {topic}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to improve your content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getRecommendationColor(rec.type)}`}>
                          {getRecommendationIcon(rec.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{rec.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {Math.round(rec.confidence * 100)}% confidence
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getRecommendationColor(rec.type)}`}>
                          {rec.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !analytics && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading analytics...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !analytics && !error && (
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600">Start creating content to see your analytics here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 