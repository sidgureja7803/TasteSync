import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMemory } from '@/hooks/useMemory'
import type { UserPreferences } from '@/types'
import {
  Settings,
  User,
  Heart,
  Target,
  Globe,
  Clock,
  Save,
  Loader2,
  AlertCircle,
  X,
  Check
} from 'lucide-react'

interface PreferencesPanelProps {
  userId: string
  onClose?: () => void
}

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ userId, onClose }) => {
  const {
    preferences,
    loading,
    error,
    loadPreferences,
    updatePreferences,
  } = useMemory()

  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    platforms: { twitter: false, linkedin: false, email: false },
    tones: [],
    topics: [],
    writingStyle: {
      length: 'medium',
      complexity: 'moderate',
      formality: 'professional'
    },
    contentTypes: [],
    targetAudience: '',
    timezone: '',
    language: 'en',
    preferences: {}
  })

  const [newTone, setNewTone] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [newContentType, setNewContentType] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadPreferences(userId)
  }, [userId, loadPreferences])

  useEffect(() => {
    if (preferences) {
      setFormData(preferences)
    }
  }, [preferences])

  const handlePlatformToggle = (platform: keyof UserPreferences['platforms']) => {
    setFormData(prev => ({
      ...prev,
      platforms: {
        twitter: prev.platforms?.twitter || false,
        linkedin: prev.platforms?.linkedin || false,
        email: prev.platforms?.email || false,
        [platform]: !prev.platforms?.[platform]
      }
    }))
  }

  const handleWritingStyleChange = (field: keyof UserPreferences['writingStyle'], value: string) => {
    setFormData(prev => ({
      ...prev,
      writingStyle: {
        length: prev.writingStyle?.length || 'medium',
        complexity: prev.writingStyle?.complexity || 'moderate',
        formality: prev.writingStyle?.formality || 'professional',
        [field]: value as any
      }
    }))
  }

  const addTone = () => {
    if (newTone.trim() && !formData.tones?.includes(newTone.trim())) {
      setFormData(prev => ({
        ...prev,
        tones: [...(prev.tones || []), newTone.trim()]
      }))
      setNewTone('')
    }
  }

  const removeTone = (tone: string) => {
    setFormData(prev => ({
      ...prev,
      tones: prev.tones?.filter(t => t !== tone) || []
    }))
  }

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics?.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...(prev.topics || []), newTopic.trim()]
      }))
      setNewTopic('')
    }
  }

  const removeTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics?.filter(t => t !== topic) || []
    }))
  }

  const addContentType = () => {
    if (newContentType.trim() && !formData.contentTypes?.includes(newContentType.trim())) {
      setFormData(prev => ({
        ...prev,
        contentTypes: [...(prev.contentTypes || []), newContentType.trim()]
      }))
      setNewContentType('')
    }
  }

  const removeContentType = (contentType: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes?.filter(ct => ct !== contentType) || []
    }))
  }

  const handleSave = async () => {
    try {
      await updatePreferences(userId, formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'email', name: 'Email', icon: '✉️' }
  ]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Personalization Settings
            </CardTitle>
            <CardDescription>
              Configure your preferences for personalized content generation
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Platforms */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Preferred Platforms
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map(platform => (
              <Button
                key={platform.id}
                variant={formData.platforms?.[platform.id as keyof UserPreferences['platforms']] ? "default" : "outline"}
                size="sm"
                onClick={() => handlePlatformToggle(platform.id as keyof UserPreferences['platforms'])}
                className="justify-start"
              >
                <span className="mr-2">{platform.icon}</span>
                {platform.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Writing Style */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Writing Style
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <select
                value={formData.writingStyle?.length || 'medium'}
                onChange={(e) => handleWritingStyleChange('length', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Complexity</label>
              <select
                value={formData.writingStyle?.complexity || 'moderate'}
                onChange={(e) => handleWritingStyleChange('complexity', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Formality</label>
              <select
                value={formData.writingStyle?.formality || 'professional'}
                onChange={(e) => handleWritingStyleChange('formality', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferred Tones */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Preferred Tones
          </h3>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Add a tone (e.g., conversational, witty)"
              value={newTone}
              onChange={(e) => setNewTone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTone()}
              className="flex-1"
            />
            <Button onClick={addTone} size="sm">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tones?.map(tone => (
              <span
                key={tone}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tone}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTone(tone)}
                  className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
          </div>
        </div>

        {/* Topics of Interest */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Topics of Interest
          </h3>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Add a topic (e.g., technology, marketing)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              className="flex-1"
            />
            <Button onClick={addTopic} size="sm">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.topics?.map(topic => (
              <span
                key={topic}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {topic}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTopic(topic)}
                  className="ml-1 h-4 w-4 p-0 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div>
          <h3 className="font-medium mb-3">Content Types</h3>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Add content type (e.g., tutorials, announcements)"
              value={newContentType}
              onChange={(e) => setNewContentType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addContentType()}
              className="flex-1"
            />
            <Button onClick={addContentType} size="sm">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.contentTypes?.map(contentType => (
              <span
                key={contentType}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {contentType}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContentType(contentType)}
                  className="ml-1 h-4 w-4 p-0 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <h3 className="font-medium mb-3">Target Audience</h3>
          <Input
            placeholder="Describe your target audience (e.g., entrepreneurs, students)"
            value={formData.targetAudience || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
          />
        </div>

        {/* Timezone and Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Timezone
            </label>
            <Input
              placeholder="e.g., America/New_York"
              value={formData.timezone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              value={formData.language || 'en'}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 