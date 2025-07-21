import React, { useState } from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  Upload,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  MessageSquare,
  Save,
  Send,
  Sparkles,
  Sliders,
  RefreshCw,
  Info,
  HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';

const Generate: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<'input' | 'preview'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Mock content for preview
  const mockGeneratedContent = {
    twitter: "AI is revolutionizing content creation! From automated writing to intelligent curation, these tools help creators work more efficiently than ever before. #AI #ContentCreation #TasteSync",
    linkedin: "Artificial Intelligence is revolutionizing how we create and distribute content across digital platforms.\n\nFrom automated writing assistants to intelligent content curation, AI tools are helping content creators work more efficiently and effectively than ever before.\n\nWhat AI tools are you using in your content workflow? Let me know in the comments!\n\n#ArtificialIntelligence #ContentCreation #DigitalMarketing",
    facebook: "Artificial Intelligence is revolutionizing content creation! From automated writing to intelligent curation, these tools are helping creators work more efficiently than ever before. What AI tools are you using?",
    instagram: "AI is changing how we create content! These powerful tools are helping creators work smarter, not harder. #AI #ContentCreation #DigitalMarketing #TasteSync"
  };
  
  // Handle generate button click
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
      setActiveStep('preview');
    }, 1500);
  };
  
  // Handle save button click
  const handleSave = () => {
    // Simulate saving
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Generate Content</h1>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-lg">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              activeStep === 'input'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveStep('input')}
          >
            1. Input
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              activeStep === 'preview'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => hasGenerated && setActiveStep('preview')}
            disabled={!hasGenerated}
          >
            2. Preview
          </button>
        </div>
      </div>
      
      {activeStep === 'input' ? (
        /* Input step */
        <div className="space-y-6">
          {/* Source content input */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Source Content</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <HelpCircle size={16} className="mr-1" />
                Tips
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="content-source" className="block text-sm font-medium mb-1">
                  Content Source
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FileText size={16} className="mr-1" />
                    Direct Input
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <LinkIcon size={16} className="mr-1" />
                    Google Docs
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <LinkIcon size={16} className="mr-1" />
                    Notion
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Upload size={16} className="mr-1" />
                    Upload File
                  </Button>
                </div>
              </div>
              
              <div>
                <label htmlFor="content-title" className="block text-sm font-medium mb-1">
                  Content Title
                </label>
                <input
                  id="content-title"
                  type="text"
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                  placeholder="Enter a title for your content..."
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="content" className="block text-sm font-medium">
                    Content
                  </label>
                  <span className="text-xs text-muted-foreground">Min. 100 characters</span>
                </div>
                <textarea
                  id="content"
                  rows={10}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                  placeholder="Paste your long-form content here or import from a source above..."
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Platform selection */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Platform Selection</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-border rounded-md p-4 flex items-center hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  id="twitter"
                  className="mr-3 h-4 w-4 accent-primary"
                  defaultChecked
                />
                <label htmlFor="twitter" className="flex items-center cursor-pointer flex-1">
                  <Twitter size={18} className="text-[#1DA1F2] mr-2" />
                  Twitter
                </label>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info size={14} />
                </Button>
              </div>
              
              <div className="border border-border rounded-md p-4 flex items-center hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  id="linkedin"
                  className="mr-3 h-4 w-4 accent-primary"
                  defaultChecked
                />
                <label htmlFor="linkedin" className="flex items-center cursor-pointer flex-1">
                  <Linkedin size={18} className="text-[#0077B5] mr-2" />
                  LinkedIn
                </label>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info size={14} />
                </Button>
              </div>
              
              <div className="border border-border rounded-md p-4 flex items-center hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  id="facebook"
                  className="mr-3 h-4 w-4 accent-primary"
                  defaultChecked
                />
                <label htmlFor="facebook" className="flex items-center cursor-pointer flex-1">
                  <Facebook size={18} className="text-[#4267B2] mr-2" />
                  Facebook
                </label>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info size={14} />
                </Button>
              </div>
              
              <div className="border border-border rounded-md p-4 flex items-center hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  id="instagram"
                  className="mr-3 h-4 w-4 accent-primary"
                  defaultChecked
                />
                <label htmlFor="instagram" className="flex items-center cursor-pointer flex-1">
                  <Instagram size={18} className="text-[#E1306C] mr-2" />
                  Instagram
                </label>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info size={14} />
                </Button>
              </div>
              
              <div className="border border-border rounded-md p-4 flex items-center hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  id="youtube"
                  className="mr-3 h-4 w-4 accent-primary"
                />
                <label htmlFor="youtube" className="flex items-center cursor-pointer flex-1">
                  <Youtube size={18} className="text-[#FF0000] mr-2" />
                  YouTube
                </label>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info size={14} />
                </Button>
              </div>
              
              <div className="border border-border rounded-md p-4 flex items-center hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  id="blog"
                  className="mr-3 h-4 w-4 accent-primary"
                />
                <label htmlFor="blog" className="flex items-center cursor-pointer flex-1">
                  <Globe size={18} className="text-gray-500 mr-2" />
                  Blog/Website
                </label>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Generation options */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generation Options</h2>
              <Button variant="outline" size="sm" className="flex items-center">
                <Sliders size={16} className="mr-1" />
                Advanced Options
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium mb-1">
                  Tone
                </label>
                <select
                  id="tone"
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="humorous">Humorous</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="length" className="block text-sm font-medium mb-1">
                  Length
                </label>
                <select
                  id="length"
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="audience" className="block text-sm font-medium mb-1">
                  Target Audience
                </label>
                <select
                  id="audience"
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                >
                  <option value="general">General</option>
                  <option value="professionals">Professionals</option>
                  <option value="technical">Technical</option>
                  <option value="executives">Executives</option>
                  <option value="students">Students</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="style" className="block text-sm font-medium mb-1">
                  Writing Style
                </label>
                <select
                  id="style"
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                >
                  <option value="informative">Informative</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="conversational">Conversational</option>
                  <option value="analytical">Analytical</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="keywords" className="block text-sm font-medium mb-1">
                  Keywords (optional)
                </label>
                <input
                  id="keywords"
                  type="text"
                  className="w-full px-3 py-2 border border-border bg-background rounded-md"
                  placeholder="Enter keywords separated by commas..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keywords will be incorporated into the generated content where appropriate
                </p>
              </div>
            </div>
          </div>
          
          {/* Generate button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              className="px-6 flex items-center"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Preview step */
        <div className="space-y-6">
          {/* Preview header */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Generated Content Preview</h2>
            <p className="text-muted-foreground">
              Review your generated content for each platform. You can regenerate specific platforms or save all content.
            </p>
          </div>
          
          {/* Platform previews */}
          <div className="space-y-6">
            {/* Twitter preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-[#1DA1F2]/10 p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Twitter size={18} className="text-[#1DA1F2] mr-2" />
                  <h3 className="font-medium">Twitter</h3>
                </div>
                <Button variant="outline" size="sm" className="flex items-center">
                  <RefreshCw size={14} className="mr-1" />
                  Regenerate
                </Button>
              </div>
              <div className="p-4 bg-card">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 mr-3"></div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold">Your Name</span>
                      <span className="text-muted-foreground ml-2 text-sm">@yourhandle</span>
                    </div>
                    <p className="mt-1">
                      {mockGeneratedContent.twitter}
                    </p>
                    <div className="mt-3 flex space-x-12 text-muted-foreground text-sm">
                      <span className="flex items-center"><MessageSquare size={14} className="mr-1" /> 5</span>
                      <span className="flex items-center"><RefreshCw size={14} className="mr-1" /> 12</span>
                      <span className="flex items-center"><MessageSquare size={14} className="mr-1" /> 24</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* LinkedIn preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-[#0077B5]/10 p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Linkedin size={18} className="text-[#0077B5] mr-2" />
                  <h3 className="font-medium">LinkedIn</h3>
                </div>
                <Button variant="outline" size="sm" className="flex items-center">
                  <RefreshCw size={14} className="mr-1" />
                  Regenerate
                </Button>
              </div>
              <div className="p-4 bg-card">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 mr-3"></div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold">Your Name</span>
                      <span className="text-muted-foreground ml-2 text-sm">• 2nd</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">Content Creator at TasteSync</p>
                    <p className="mt-1 whitespace-pre-line">
                      {mockGeneratedContent.linkedin}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Facebook preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-[#4267B2]/10 p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Facebook size={18} className="text-[#4267B2] mr-2" />
                  <h3 className="font-medium">Facebook</h3>
                </div>
                <Button variant="outline" size="sm" className="flex items-center">
                  <RefreshCw size={14} className="mr-1" />
                  Regenerate
                </Button>
              </div>
              <div className="p-4 bg-card">
                <div className="flex flex-col">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 mr-3"></div>
                    <div>
                      <span className="font-medium">Your Name</span>
                      <p className="text-muted-foreground text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <p className="mb-3">
                    {mockGeneratedContent.facebook}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Instagram preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-[#E1306C]/10 p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Instagram size={18} className="text-[#E1306C] mr-2" />
                  <h3 className="font-medium">Instagram</h3>
                </div>
                <Button variant="outline" size="sm" className="flex items-center">
                  <RefreshCw size={14} className="mr-1" />
                  Regenerate
                </Button>
              </div>
              <div className="p-4 bg-card">
                <div className="flex flex-col">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 mr-2"></div>
                    <span className="font-medium">youraccount</span>
                  </div>
                  <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground">
                    Image Preview
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">youraccount</span> {mockGeneratedContent.instagram}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="lg"
              className="px-6"
              onClick={() => setActiveStep('input')}
            >
              Back to Edit
            </Button>
            
            <div className="space-x-3">
              <Button
                variant="outline"
                size="lg"
                className="px-6 flex items-center"
                onClick={handleSave}
              >
                <Save size={18} className="mr-2" />
                Save Draft
              </Button>
              
              <Button
                size="lg"
                className="px-6 flex items-center"
                onClick={handleSave}
              >
                <Send size={18} className="mr-2" />
                Save & Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generate;