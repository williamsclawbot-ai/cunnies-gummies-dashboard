// Feed Service - YouTube & AI News Integration

const AI_KEYWORDS = [
  'claude', 'claude code', 'anthropic', 'open claw', 'openclaw',
  'ai agent', 'ai coding', 'cursor', 'copilot', 'gpt',
  'openai', 'gemini', 'llm', 'prompt engineering',
];

export async function fetchAIVideos() {
  // Return demo data directly — swap in a real API call when ready
  return getDemoVideos();
}

export async function fetchAINews() {
  // Return demo data directly — swap in a real API call when ready
  return getDemoNews();
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function getCategoryColor(category) {
  const colors = {
    'Claude': '#667eea',
    'Anthropic': '#764ba2',
    'OpenAI': '#10a37f',
    'AI Research': '#f59e0b',
    'Industry': '#3b82f6',
    'Open Source': '#22c55e',
    'Regulation': '#ef4444',
  };
  return colors[category] || '#6b7280';
}

function getDemoVideos() {
  return [
    {
      videoId: 'claude-code-overview-2026',
      title: 'Claude Code: The AI Coding Agent That Changes Everything',
      published: '2026-03-06T14:00:00Z',
      author: 'Fireship',
      description: 'Claude Code is Anthropic\'s CLI-based AI coding agent that reads your codebase, writes code, runs tests, and commits to git.',
      thumbnail: 'https://img.youtube.com/vi/ee7o3Drnuek/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=claude+code+anthropic',
      transcriptSummary: 'Claude Code is a terminal-based AI coding assistant from Anthropic that operates directly in your development environment. Unlike traditional AI chat, Claude Code can navigate your entire codebase, understand project architecture, write and edit files, run terminal commands, and manage git workflows. The video covers multi-file editing, test-driven development workflows, and the agentic loop that allows Claude to iterate on solutions. It demonstrates building a full REST API from scratch, showing how Claude Code handles error debugging, refactoring, and architectural decisions.',
      prompts: [
        'Build a REST API with Express that handles user authentication with JWT tokens',
        'Write tests for all the auth endpoints and fix any failures',
        'Refactor the middleware to use async/await and add proper error handling',
      ],
      tags: ['Claude Code', 'Anthropic', 'AI Coding'],
    },
    {
      videoId: 'saas-claude-code-2026',
      title: 'I Built an Entire SaaS App Using Only Claude Code in 4 Hours',
      published: '2026-03-05T10:00:00Z',
      author: 'Matt Wolfe',
      description: 'Testing whether Claude Code can build a production-ready SaaS application from scratch. Full walkthrough from idea to deployment.',
      thumbnail: 'https://img.youtube.com/vi/jHv63Uvk5VA/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=build+saas+with+claude+code',
      transcriptSummary: 'The creator built a complete SaaS invoice management tool using only Claude Code. Starting from a blank directory, they prompted Claude Code step by step: setting up a Next.js project with TypeScript, designing the database schema with Prisma, building the full UI with Tailwind CSS, implementing Stripe payment integration, and deploying to Vercel. Key takeaways: Claude Code excels at understanding context across files, can debug its own errors when tests fail, and handles complex multi-step tasks like payment integration remarkably well.',
      prompts: [
        'Set up a new Next.js 14 project with TypeScript, Prisma, and Tailwind CSS',
        'Design a database schema for an invoice management SaaS with users, clients, and invoices',
        'Implement Stripe checkout integration with webhook handling for subscription management',
        'Deploy this to Vercel and fix any build errors',
      ],
      tags: ['Claude Code', 'SaaS', 'Full Stack'],
    },
    {
      videoId: 'open-claw-explained-2026',
      title: 'Open Claw: The Open Source AI Agent Framework Explained',
      published: '2026-03-04T16:00:00Z',
      author: 'AI Explained',
      description: 'Deep dive into Open Claw — the open-source framework for building AI agents. Architecture, benchmarks, and real-world use cases.',
      thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=open+claw+ai+agent+framework',
      transcriptSummary: 'Open Claw is an open-source framework for building autonomous AI agents that interact with tools, APIs, and environments. The video breaks down its architecture: a core reasoning loop powered by LLMs, a modular tool system, memory management for long-running tasks, and a safety layer for controlling agent actions. Benchmarks show it performs competitively with proprietary solutions on SWE-bench and GAIA. The presenter builds a research agent that browses the web, analyzes papers, and generates summary reports.',
      prompts: [
        'Create an agent that searches ArXiv for recent papers on transformer architectures',
        'Build a tool plugin that connects to the GitHub API for code analysis',
      ],
      tags: ['Open Claw', 'AI Agents', 'Open Source'],
    },
    {
      videoId: 'claude-vs-gpt5-2026',
      title: 'Claude 4.5 Opus vs GPT-5: The Ultimate AI Benchmark Showdown',
      published: '2026-03-03T12:00:00Z',
      author: 'Two Minute Papers',
      description: 'Head-to-head comparison across coding, reasoning, creative writing, and multimodal tasks.',
      thumbnail: 'https://img.youtube.com/vi/SqEu1jag3GY/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=claude+opus+vs+gpt+5+benchmark',
      transcriptSummary: 'A comprehensive benchmark comparison between Claude 4.5 Opus and GPT-5 across coding (HumanEval, SWE-bench), reasoning (GPQA, MATH), creative writing, and multimodal understanding. Claude 4.5 Opus shows particular strength in coding tasks and extended reasoning, while GPT-5 edges ahead in certain multimodal benchmarks. Both models represent a significant leap over predecessors — the choice often depends on specific use case.',
      prompts: [],
      tags: ['Anthropic', 'Claude', 'Benchmarks', 'OpenAI'],
    },
    {
      videoId: 'agent-sdk-prod-2026',
      title: 'Building Production AI Agents with Claude Agent SDK',
      published: '2026-03-02T09:00:00Z',
      author: 'Yannic Kilcher',
      description: 'Technical deep dive into Anthropic\'s Claude Agent SDK — build, deploy, and monitor production-grade AI agents.',
      thumbnail: 'https://img.youtube.com/vi/zjkBMFhNj_g/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=claude+agent+sdk+tutorial',
      transcriptSummary: 'A hands-on guide to building production AI agents using Anthropic\'s Agent SDK. Topics include: setting up the SDK, defining tool schemas, implementing the agent loop with error handling, streaming responses for real-time feedback, managing conversation context and memory, and deploying agents behind an API. The presenter builds a customer support agent that looks up orders, processes refunds, and escalates issues.',
      prompts: [
        'Initialize a new agent with tools for order lookup, refund processing, and ticket escalation',
        'Add streaming response support so the UI updates in real-time as the agent works',
        'Implement conversation memory so the agent remembers context across multiple turns',
      ],
      tags: ['Agent SDK', 'Anthropic', 'Production AI'],
    },
    {
      videoId: 'prompt-eng-advanced-2026',
      title: 'Advanced Prompt Engineering: Techniques the Pros Use with Claude',
      published: '2026-03-01T15:00:00Z',
      author: 'Fireship',
      description: 'Level up your prompt engineering with advanced techniques optimized for Claude models.',
      thumbnail: 'https://img.youtube.com/vi/ee7o3Drnuek/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=advanced+prompt+engineering+claude',
      transcriptSummary: 'Covers advanced prompt engineering techniques optimized for Claude: XML tag structuring for complex prompts, chain-of-thought reasoning with thinking blocks, few-shot prompting with diverse examples, system prompt design for consistent behavior, tool use prompt patterns, and meta-prompting. Each technique is demonstrated with before/after examples showing quality improvement.',
      prompts: [
        'You are an expert code reviewer. Analyze the following code for security vulnerabilities, performance issues, and best practice violations. Structure your response with XML tags.',
        'Using chain-of-thought reasoning, solve this optimization problem step by step. Show your work in <thinking> tags before giving the final answer.',
      ],
      tags: ['Prompt Engineering', 'Claude', 'Best Practices'],
    },
  ];
}

function getDemoNews() {
  return [
    {
      id: 'news-1',
      title: 'Anthropic Launches Claude Code for Teams with Enterprise Features',
      source: 'TechCrunch',
      url: 'https://techcrunch.com',
      publishedAt: '2026-03-07T08:00:00Z',
      summary: 'Anthropic has released Claude Code for Teams, bringing the AI coding agent to enterprise environments with SSO integration, audit logging, custom policy controls, and shared session management.',
      category: 'Claude',
    },
    {
      id: 'news-2',
      title: 'OpenAI Announces GPT-5 Turbo with Improved Reasoning Capabilities',
      source: 'The Verge',
      url: 'https://theverge.com',
      publishedAt: '2026-03-06T14:30:00Z',
      summary: 'OpenAI has unveiled GPT-5 Turbo, a faster and more cost-effective variant of their flagship model featuring improved mathematical reasoning, better code generation, and a 256K context window.',
      category: 'OpenAI',
    },
    {
      id: 'news-3',
      title: 'Google DeepMind\'s Gemini 3.0 Sets New Records on Scientific Benchmarks',
      source: 'Ars Technica',
      url: 'https://arstechnica.com',
      publishedAt: '2026-03-05T11:00:00Z',
      summary: 'Google DeepMind released Gemini 3.0, claiming state-of-the-art results on scientific reasoning benchmarks including GPQA Diamond and ScienceQA, with native multimodal generation capabilities.',
      category: 'AI Research',
    },
    {
      id: 'news-4',
      title: 'AI Coding Assistants Now Used by 78% of Professional Developers',
      source: 'Stack Overflow Blog',
      url: 'https://stackoverflow.blog',
      publishedAt: '2026-03-04T09:15:00Z',
      summary: 'Stack Overflow\'s 2026 Developer Survey reveals 78% of professional developers now regularly use AI coding assistants, up from 44% in 2024. Claude Code and GitHub Copilot lead adoption.',
      category: 'Industry',
    },
    {
      id: 'news-5',
      title: 'Open Source AI Agent Framework "Open Claw" Reaches 50K GitHub Stars',
      source: 'VentureBeat',
      url: 'https://venturebeat.com',
      publishedAt: '2026-03-03T16:45:00Z',
      summary: 'The open-source AI agent framework Open Claw has surpassed 50,000 GitHub stars, making it one of the fastest-growing AI projects with contributions from Anthropic, Meta, and the community.',
      category: 'Open Source',
    },
    {
      id: 'news-6',
      title: 'EU AI Act Enforcement Begins: What Developers Need to Know',
      source: 'Wired',
      url: 'https://wired.com',
      publishedAt: '2026-03-02T13:00:00Z',
      summary: 'The EU AI Act\'s first enforcement provisions take effect, requiring mandatory risk assessments for high-risk AI systems, transparency obligations for generative AI, and new reporting requirements.',
      category: 'Regulation',
    },
    {
      id: 'news-7',
      title: 'Microsoft Integrates Claude into VS Code as First-Party Extension',
      source: 'Bloomberg',
      url: 'https://bloomberg.com',
      publishedAt: '2026-03-01T10:30:00Z',
      summary: 'Microsoft announced a first-party VS Code extension for Claude, allowing developers to use Anthropic\'s models directly within the editor alongside GitHub Copilot.',
      category: 'Industry',
    },
    {
      id: 'news-8',
      title: 'AI Agents Can Now Solve 85% of Real-World Software Engineering Tasks',
      source: 'MIT Technology Review',
      url: 'https://technologyreview.com',
      publishedAt: '2026-02-28T14:00:00Z',
      summary: 'New research from UC Berkeley shows the latest AI coding agents resolve 85% of real-world GitHub issues from SWE-bench Verified, up from 49% just one year ago.',
      category: 'AI Research',
    },
  ];
}
