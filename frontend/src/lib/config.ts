export const config = {
  app: {
    name: 'TasteSync',
    description: 'Transform long-form content into audience-personalized social media content using AI',
    version: '1.0.0',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },
  together: {
    apiKey: import.meta.env.VITE_TOGETHER_API_KEY || '',
  },
  platforms: {
    twitter: {
      maxLength: 280,
      threadMaxLength: 25,
    },
    linkedin: {
      maxLength: 3000,
      carouselMaxSlides: 10,
    },
    email: {
      subjectMaxLength: 50,
      bodyMaxLength: 10000,
    },
  },
  tones: [
    'Professional',
    'Casual',
    'Friendly',
    'Authoritative',
    'Conversational',
    'Witty',
    'Inspiring',
    'Educational',
    'Promotional',
    'Analytical',
    'Storytelling',
    'Humorous',
    'Empathetic',
    'Bold',
    'Minimalist',
    'Technical',
  ],
  maxTokens: {
    free: 10000,
    pro: 100000,
    enterprise: 1000000,
  },
} 