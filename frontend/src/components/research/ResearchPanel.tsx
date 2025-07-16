import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useResearch } from '@/hooks/useResearch'
import {
  Search,
  TrendingUp,
  CheckCircle,
  BookOpen,
  ExternalLink,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react'

interface ResearchPanelProps {
  onClose?: () => void
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ onClose }) => {
  const {
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
  } = useResearch()

  const [searchQuery, setSearchQuery] = useState('')
  const [researchQuery, setResearchQuery] = useState('')
  const [verificationText, setVerificationText] = useState('')
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'research' | 'verify'>('search')

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    await searchContent(searchQuery, { maxResults: 5 })
  }

  const handleResearch = async () => {
    if (!researchQuery.trim()) return
    await researchTopic(researchQuery, { 
      includeCompetitors: true, 
      includeStats: true, 
      maxResults: 10 
    })
  }

  const handleVerify = async () => {
    if (!verificationText.trim()) return
    await verifyContent(verificationText)
  }

  const handleGetTrending = async () => {
    await getTrendingTopics()
  }

  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'verify', label: 'Verify', icon: CheckCircle },
  ]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Research Tools
            </CardTitle>
            <CardDescription>
              Search, research, and verify content using AI-powered tools
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1"
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for content, topics, or information..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Search Results:</h4>
                {searchResults.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{result.title}</h5>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {result.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="space-y-4">
            <Button onClick={handleGetTrending} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Get Trending Topics
            </Button>
            
            {trendingTopics.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Trending Topics:</h4>
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{topic.topic}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{topic.platform}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          +{topic.growth}%
                        </span>
                      </div>
                    </div>
                    {topic.insights.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">{topic.insights[0]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter a topic to research in detail..."
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              />
              <Button onClick={handleResearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              </Button>
            </div>
            
            {researchData && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Research Summary:</h4>
                  <p className="text-sm text-gray-600">{researchData.summary}</p>
                </div>
                
                {researchData.keyFindings.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Findings:</h4>
                    <ul className="space-y-1">
                      {researchData.keyFindings.map((finding, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {researchData.opportunities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Opportunities:</h4>
                    <ul className="space-y-1">
                      {researchData.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                placeholder="Enter content to verify for accuracy..."
                value={verificationText}
                onChange={(e) => setVerificationText(e.target.value)}
                className="w-full p-3 border rounded-md resize-none h-32 text-sm"
              />
              <Button onClick={handleVerify} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Verify Content
              </Button>
            </div>
            
            {verificationResult && (
              <div className={`p-4 rounded-md ${verificationResult.isAccurate ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center mb-2">
                  <CheckCircle className={`w-4 h-4 mr-2 ${verificationResult.isAccurate ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="font-medium">
                    {verificationResult.isAccurate ? 'Content appears accurate' : 'Content needs verification'}
                  </span>
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    {Math.round(verificationResult.confidence * 100)}% confidence
                  </span>
                </div>
                
                {verificationResult.corrections.length > 0 && (
                  <div className="mt-3">
                    <h5 className="font-medium text-sm mb-1">Suggested corrections:</h5>
                    <ul className="space-y-1">
                      {verificationResult.corrections.map((correction, index) => (
                        <li key={index} className="text-sm text-gray-600">• {correction}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {verificationResult.warnings.length > 0 && (
                  <div className="mt-3">
                    <h5 className="font-medium text-sm mb-1">Warnings:</h5>
                    <ul className="space-y-1">
                      {verificationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700">⚠️ {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Clear Results */}
        {(searchResults.length > 0 || trendingTopics.length > 0 || researchData || verificationResult) && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={clearResults} className="w-full">
              Clear Results
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 