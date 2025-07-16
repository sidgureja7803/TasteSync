import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CopilotTextarea } from '@copilotkit/react-textarea'
import { useCopilotContext, useCopilotReadable, useCopilotAction } from '@copilotkit/react-core'
import { ResearchPanel } from '@/components/research/ResearchPanel'
import { PreferencesPanel } from '@/components/memory/PreferencesPanel'
import { AnalyticsPanel } from '@/components/memory/AnalyticsPanel'
import { 
  FileText, 
  Save, 
  Download, 
  Share, 
  Settings,
  MessageSquare,
  Brain,
  Twitter,
  Linkedin,
  Mail,
  Search,
  TrendingUp,
  BarChart3,
  User,
  Sparkles
} from 'lucide-react'

export default function Dashboard() {
  const [content, setContent] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('twitter')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [showResearchPanel, setShowResearchPanel] = useState(false)
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false)
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false)
  const [enhancedMode, setEnhancedMode] = useState(false)

  // Mock user ID - in real app, this would come from auth
  const userId = 'user-123'

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'email', name: 'Email', icon: Mail }
  ]

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'casual', name: 'Casual' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'formal', name: 'Formal' },
    { id: 'humorous', name: 'Humorous' }
  ]

  // Make user preferences available to CopilotKit
  useCopilotReadable({
    description: 'Current user preferences for content optimization',
    value: {
      selectedPlatform,
      selectedTone,
      content,
      enhancedMode,
      userId,
      platformGuidelines: {
        twitter: 'Keep it concise (280 characters max), use hashtags, make it engaging',
        linkedin: 'Professional tone, longer form allowed, focus on business value',
        email: 'Clear subject line, structured content, call-to-action'
      }
    }
  })

  // Add enhanced action for AI rewriting with research and memory
  useCopilotAction({
    name: 'rewrite_content_enhanced',
    description: 'Rewrite the current content with AI research and personalization',
    parameters: [
      {
        name: 'newContent',
        type: 'string',
        description: 'The enhanced rewritten content',
        required: true,
      },
      {
        name: 'researchInsights',
        type: 'string',
        description: 'Research insights used in the rewrite',
        required: false,
      },
      {
        name: 'personalizationApplied',
        type: 'string',
        description: 'Personalization features applied',
        required: false,
      },
    ],
    handler: async ({ newContent, researchInsights, personalizationApplied }: any) => {
      setContent(newContent)
      if (researchInsights) {
        console.log('Research insights:', researchInsights)
      }
      if (personalizationApplied) {
        console.log('Personalization applied:', personalizationApplied)
      }
    },
  })

  // Add original action for basic AI rewriting
  useCopilotAction({
    name: 'rewrite_content',
    description: 'Rewrite the current content for the selected platform and tone',
    parameters: [
      {
        name: 'newContent',
        type: 'string',
        description: 'The rewritten content',
        required: true,
      },
    ],
    handler: async ({ newContent }: any) => {
      setContent(newContent)
    },
  })

  // Add action for suggesting improvements
  useCopilotAction({
    name: 'suggest_improvements',
    description: 'Suggest improvements for the current content',
    parameters: [
      {
        name: 'suggestions',
        type: 'string',
        description: 'Improvement suggestions',
        required: true,
      },
    ],
    handler: async ({ suggestions }: any) => {
      // Display suggestions in a toast or modal
      console.log('AI Suggestions:', suggestions)
      alert('AI Suggestions:\n' + suggestions)
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TasteSync
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={enhancedMode ? "default" : "outline"}
              size="sm"
              onClick={() => setEnhancedMode(!enhancedMode)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Enhanced Mode
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAnalyticsPanel(true)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreferencesPanel(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Content Editor
                  {enhancedMode && (
                    <span className="ml-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-full">
                      Enhanced
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {enhancedMode 
                    ? 'AI-powered content editor with research and personalization features.'
                    : 'Write your long-form content here. The AI will help you transform it into platform-specific posts.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Enhanced Mode Tools */}
                  {enhancedMode && (
                    <div className="flex space-x-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-md">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResearchPanel(true)}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Research
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreferencesPanel(true)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Preferences
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnalyticsPanel(true)}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Insights
                      </Button>
                    </div>
                  )}

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Platform</label>
                    <div className="flex space-x-2">
                      {platforms.map(platform => {
                        const Icon = platform.icon
                        return (
                          <Button
                            key={platform.id}
                            variant={selectedPlatform === platform.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedPlatform(platform.id)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {platform.name}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tone</label>
                    <select 
                      value={selectedTone} 
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {tones.map(tone => (
                        <option key={tone.id} value={tone.id}>
                          {tone.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CopilotTextarea - AI-powered content editor */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <CopilotTextarea
                      value={content}
                      onValueChange={setContent}
                      placeholder={`Start writing your content here... 

You can use markdown formatting:
- **bold text**
- *italic text*
- # Headers
- - Lists
- [links](https://example.com)

${enhancedMode ? 'Enhanced mode is active! The AI will use research and personalization features to help optimize your content.' : 'The AI will help you optimize this content for your selected platform and tone.'}

Try asking: ${enhancedMode ? '"Research this topic and rewrite in casual tone"' : '"Rewrite this in casual tone"'} or "Make this better for ${selectedPlatform}"`}
                      className="w-full h-96 p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autosuggestionsConfig={{
                        textareaPurpose: `Content editor for ${selectedPlatform} posts with ${selectedTone} tone${enhancedMode ? ' (Enhanced mode with research and personalization)' : ''}`,
                        chatApiConfigs: {}
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Trigger AI rewrite
                        const prompt = enhancedMode 
                          ? `[Enhanced AI with research and personalization is rewriting this content for ${selectedPlatform} with ${selectedTone} tone...]`
                          : `[AI is rewriting this content for ${selectedPlatform} with ${selectedTone} tone...]`
                        setContent(prev => prev + '\n\n' + prompt);
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {enhancedMode ? 'Enhanced AI Rewrite' : 'AI Rewrite'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  AI Assistant
                  {enhancedMode && (
                    <span className="ml-2 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-full">
                      Enhanced
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {enhancedMode 
                    ? 'Enhanced AI assistant with research and personalization capabilities.'
                    : 'Chat with your AI assistant to get help with content optimization.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Current settings: <strong>{selectedPlatform}</strong> with <strong>{selectedTone}</strong> tone
                    {enhancedMode && <span className="text-blue-600"> (Enhanced Mode)</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    Try asking:
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      "Rewrite in {selectedTone} tone"
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      "Make this better for {selectedPlatform}"
                    </Button>
                    {enhancedMode && (
                      <>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          "Research this topic and optimize"
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          "Personalize based on my preferences"
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          "What's trending in my industry?"
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      "Add more engagement hooks"
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      "Suggest improvements"
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  {enhancedMode 
                    ? `AI-enhanced content for ${selectedPlatform} with research and personalization`
                    : `AI-optimized content for ${selectedPlatform} in ${selectedTone} tone`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 text-center py-8">
                  {content ? (
                    <div className="text-left">
                      <p className="font-medium mb-2">Preview:</p>
                      <div className="bg-gray-50 p-3 rounded border text-sm">
                        {content.substring(0, 200)}
                        {content.length > 200 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">Start writing content to see AI-generated suggestions here.</p>
                      {enhancedMode && (
                        <p className="text-blue-600 text-xs">Enhanced mode will provide research insights and personalized recommendations.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Overlays */}
      {showResearchPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ResearchPanel onClose={() => setShowResearchPanel(false)} />
          </div>
        </div>
      )}

      {showPreferencesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PreferencesPanel userId={userId} onClose={() => setShowPreferencesPanel(false)} />
          </div>
        </div>
      )}

      {showAnalyticsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <AnalyticsPanel userId={userId} onClose={() => setShowAnalyticsPanel(false)} />
          </div>
        </div>
      )}
    </div>
  )
} 