import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { clerkId: 'user_sample_1' },
    update: {},
    create: {
      clerkId: 'user_sample_1',
      email: 'john@example.com',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      credits: 8500,
      plan: 'FREE',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { clerkId: 'user_sample_2' },
    update: {},
    create: {
      clerkId: 'user_sample_2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9b615d9?w=150&h=150&fit=crop&crop=face',
      credits: 50000,
      plan: 'PRO',
    },
  });

  // Create sample documents
  const document1 = await prisma.document.upsert({
    where: { id: 'doc_sample_1' },
    update: {},
    create: {
      id: 'doc_sample_1',
      title: 'The Future of AI in Web Development',
      content: `# The Future of AI in Web Development

Artificial Intelligence is rapidly transforming the landscape of web development. From automated code generation to intelligent testing, AI tools are becoming indispensable for modern developers.

## Key Areas of Impact

### 1. Code Generation
AI-powered tools like GitHub Copilot and ChatGPT are revolutionizing how developers write code. These tools can:
- Generate boilerplate code instantly
- Suggest optimizations and best practices
- Help debug complex issues
- Create documentation automatically

### 2. Testing and Quality Assurance
AI is making testing more efficient through:
- Automated test case generation
- Intelligent bug detection
- Performance optimization suggestions
- Security vulnerability scanning

### 3. Design and UX
AI tools are also impacting design:
- Automated layout generation
- Color palette suggestions
- Accessibility improvements
- User behavior analysis

## Looking Ahead

The future of web development will likely see even deeper integration of AI tools. Developers who embrace these technologies will be better positioned to create innovative, efficient, and scalable web applications.

The key is to view AI as a powerful assistant rather than a replacement, leveraging its capabilities to enhance human creativity and productivity.`,
      source: 'PASTE',
      userId: user1.id,
    },
  });

  const document2 = await prisma.document.upsert({
    where: { id: 'doc_sample_2' },
    update: {},
    create: {
      id: 'doc_sample_2',
      title: '10 Productivity Tips for Remote Workers',
      content: `# 10 Productivity Tips for Remote Workers

Remote work has become the new normal, but staying productive while working from home can be challenging. Here are 10 proven strategies to boost your productivity.

## 1. Create a Dedicated Workspace
Having a specific area for work helps create mental boundaries between personal and professional life.

## 2. Establish a Routine
Start your day at the same time and follow a consistent morning routine to signal your brain that it's time to work.

## 3. Use Time Blocking
Schedule specific time slots for different tasks to maintain focus and avoid multitasking.

## 4. Take Regular Breaks
Follow the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.

## 5. Minimize Distractions
Turn off notifications, use website blockers, and create a quiet environment.

## 6. Stay Connected
Regular communication with colleagues helps maintain team cohesion and prevents isolation.

## 7. Set Clear Boundaries
Define your working hours and stick to them to maintain work-life balance.

## 8. Invest in Good Tools
Quality equipment and software can significantly impact your productivity and comfort.

## 9. Practice Self-Care
Regular exercise, proper nutrition, and adequate sleep are essential for sustained productivity.

## 10. Continuous Learning
Use the flexibility of remote work to develop new skills and stay updated with industry trends.

Remember, productivity is personal. Experiment with these tips to find what works best for you.`,
      source: 'PASTE',
      userId: user2.id,
    },
  });

  // Create sample generated content
  const generatedContent1 = await prisma.generatedContent.create({
    data: {
      documentId: document1.id,
      platform: 'TWITTER',
      tone: 'Professional',
      content: JSON.stringify({
        tweets: [
          '🚀 AI is transforming web development! From code generation to automated testing, these tools are becoming essential for modern developers.',
          '💡 Key areas where AI is making an impact:\n• Code generation (GitHub Copilot)\n• Automated testing\n• Design optimization\n• Security scanning',
          '🔮 The future? Even deeper AI integration. Developers who embrace these tools will build more innovative, efficient applications.',
          '🎯 Remember: AI is a powerful assistant, not a replacement. Use it to enhance your creativity and productivity! #WebDev #AI #Programming'
        ],
        thread: true,
        hashtags: ['#WebDev', '#AI', '#Programming', '#Tech', '#Innovation'],
        characterCount: 456,
        tweetCount: 4
      }),
      metadata: {
        model: 'deepseek-v3',
        targetAudience: 'developers'
      },
      tokensUsed: 1200,
      userId: user1.id,
    },
  });

  const generatedContent2 = await prisma.generatedContent.create({
    data: {
      documentId: document2.id,
      platform: 'LINKEDIN',
      tone: 'Conversational',
      content: JSON.stringify({
        post: `Remote work productivity isn't just about working harder—it's about working smarter. 📈

After helping hundreds of professionals optimize their remote work setup, I've identified the 10 most impactful strategies:

✅ Create a dedicated workspace (mental boundaries are crucial)
✅ Establish consistent routines (your brain loves predictability)
✅ Use time blocking (single-tasking > multitasking)
✅ Take regular breaks (Pomodoro technique works!)
✅ Minimize distractions (notifications are productivity killers)

The key insight? Productivity is deeply personal. What works for your colleague might not work for you.

Start with 2-3 strategies, experiment, and gradually build your perfect remote work system.

💡 What's your #1 remote work productivity hack?`,
        hashtags: ['#RemoteWork', '#Productivity', '#WorkFromHome', '#Professional', '#Tips'],
        characterCount: 847,
        slideCount: 0,
        hasCarousel: false
      }),
      metadata: {
        model: 'deepseek-v3',
        targetAudience: 'professionals'
      },
      tokensUsed: 1500,
      userId: user2.id,
    },
  });

  // Create sample token usage records
  await prisma.tokenUsage.create({
    data: {
      userId: user1.id,
      model: 'deepseek-v3',
      inputTokens: 800,
      outputTokens: 400,
      totalTokens: 1200,
      cost: 0.0014,
      operation: 'content_generation',
    },
  });

  await prisma.tokenUsage.create({
    data: {
      userId: user2.id,
      model: 'deepseek-v3',
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      cost: 0.0021,
      operation: 'content_generation',
    },
  });

  await prisma.tokenUsage.create({
    data: {
      userId: user1.id,
      model: 'deepseek-v3',
      inputTokens: 600,
      outputTokens: 300,
      totalTokens: 900,
      cost: 0.00126,
      operation: 'content_analysis',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👥 Created ${2} users`);
  console.log(`📄 Created ${2} documents`);
  console.log(`🎨 Created ${2} generated content items`);
  console.log(`📊 Created ${3} token usage records`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 