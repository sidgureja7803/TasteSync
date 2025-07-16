import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CopilotTextarea } from '@copilotkit/react-textarea'
import { useCopilotContext, useCopilotReadable, useCopilotAction } from '@copilotkit/react-core'
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
  Mail
} from 'lucide-react'

export default function Dashboard() {
  const [content, setContent] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('twitter')
  const [selectedTone, setSelectedTone] = useState('professional')

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
      platformGuidelines: {
        twitter: 'Keep it concise (280 characters max), use hashtags, make it engaging',
        linkedin: 'Professional tone, longer form allowed, focus on business value',
        email: 'Clear subject line, structured content, call-to-action'
      }
    }
  })

  // Add action for AI rewriting
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
    handler: async ({ newContent }) => {
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
    handler: async ({ suggestions }) => {
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
            <Button variant="outline" size="sm">
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
                </CardTitle>
                <CardDescription>
                  Write your long-form content here. The AI will help you transform it into platform-specific posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                      placeholder="Start writing your content here... 

You can use markdown formatting:
- **bold text**
- *italic text*
- # Headers
- - Lists
- [links](https://example.com)

The AI will help you optimize this content for your selected platform and tone.

Try asking: 'Rewrite this in casual tone' or 'Make this better for Twitter'"
                      className="w-full h-96 p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autosuggestionsConfig={{
                        textareaPurpose: `Content editor for ${selectedPlatform} posts with ${selectedTone} tone`,
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
                        setContent(prev => prev + '\n\n[AI is rewriting this content for ' + selectedPlatform + ' with ' + selectedTone + ' tone...]');
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      AI Rewrite
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
                </CardTitle>
                <CardDescription>
                  Chat with your AI assistant to get help with content optimization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Current settings: <strong>{selectedPlatform}</strong> with <strong>{selectedTone}</strong> tone
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
                  AI-optimized content for {selectedPlatform} in {selectedTone} tone
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
                    'Start writing content to see AI-generated suggestions here.'
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 