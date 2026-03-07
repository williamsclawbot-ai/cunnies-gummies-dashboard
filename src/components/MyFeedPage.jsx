import React, { useState } from 'react';

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return diffMins + 'm ago';
  if (diffHours < 24) return diffHours + 'h ago';
  if (diffDays < 7) return diffDays + 'd ago';
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const CATEGORY_COLORS = {
  'Claude': '#667eea',
  'Anthropic': '#764ba2',
  'OpenAI': '#10a37f',
  'AI Research': '#f59e0b',
  'Industry': '#3b82f6',
  'Open Source': '#22c55e',
  'Regulation': '#ef4444',
};

const VIDEOS = [
  {
    videoId: 'claude-code-overview-2026',
    title: 'Claude Code: The AI Coding Agent That Changes Everything',
    published: '2026-03-06T14:00:00Z',
    author: 'Fireship',
    description: "Claude Code is Anthropic's CLI-based AI coding agent that reads your codebase, writes code, runs tests, and commits to git.",
    thumbnail: 'https://img.youtube.com/vi/ee7o3Drnuek/mqdefault.jpg',
    url: 'https://www.youtube.com/results?search_query=claude+code+anthropic',
    transcriptSummary: 'Claude Code is a terminal-based AI coding assistant from Anthropic that operates directly in your development environment. Unlike traditional AI chat, Claude Code can navigate your entire codebase, understand project architecture, write and edit files, run terminal commands, and manage git workflows. The video covers multi-file editing, test-driven development workflows, and the agentic loop that allows Claude to iterate on solutions.',
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
    description: 'Testing whether Claude Code can build a production-ready SaaS application from scratch.',
    thumbnail: 'https://img.youtube.com/vi/jHv63Uvk5VA/mqdefault.jpg',
    url: 'https://www.youtube.com/results?search_query=build+saas+with+claude+code',
    transcriptSummary: 'The creator built a complete SaaS invoice management tool using only Claude Code. Starting from a blank directory, they prompted Claude Code step by step: setting up Next.js with TypeScript, designing the database schema with Prisma, building the UI with Tailwind CSS, implementing Stripe payment integration, and deploying to Vercel.',
    prompts: [
      'Set up a new Next.js 14 project with TypeScript, Prisma, and Tailwind CSS',
      'Design a database schema for an invoice management SaaS',
      'Implement Stripe checkout integration with webhook handling',
      'Deploy this to Vercel and fix any build errors',
    ],
    tags: ['Claude Code', 'SaaS', 'Full Stack'],
  },
  {
    videoId: 'open-claw-explained-2026',
    title: 'Open Claw: The Open Source AI Agent Framework Explained',
    published: '2026-03-04T16:00:00Z',
    author: 'AI Explained',
    description: 'Deep dive into Open Claw, the open-source framework for building AI agents.',
    thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg',
    url: 'https://www.youtube.com/results?search_query=open+claw+ai+agent+framework',
    transcriptSummary: 'Open Claw is an open-source framework for building autonomous AI agents. The video breaks down its architecture: a core reasoning loop powered by LLMs, a modular tool system, memory management for long-running tasks, and a safety layer for controlling agent actions.',
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
    transcriptSummary: 'A comprehensive benchmark comparison between Claude 4.5 Opus and GPT-5 across coding (HumanEval, SWE-bench), reasoning (GPQA, MATH), creative writing, and multimodal understanding. Claude 4.5 Opus shows strength in coding and extended reasoning.',
    prompts: [],
    tags: ['Anthropic', 'Claude', 'Benchmarks', 'OpenAI'],
  },
  {
    videoId: 'agent-sdk-prod-2026',
    title: 'Building Production AI Agents with Claude Agent SDK',
    published: '2026-03-02T09:00:00Z',
    author: 'Yannic Kilcher',
    description: "Technical deep dive into Anthropic's Claude Agent SDK for production-grade AI agents.",
    thumbnail: 'https://img.youtube.com/vi/zjkBMFhNj_g/mqdefault.jpg',
    url: 'https://www.youtube.com/results?search_query=claude+agent+sdk+tutorial',
    transcriptSummary: "A hands-on guide to building production AI agents using Anthropic's Agent SDK. Topics include setting up the SDK, defining tool schemas, implementing the agent loop, streaming responses, and deploying agents behind an API.",
    prompts: [
      'Initialize a new agent with tools for order lookup, refund processing, and ticket escalation',
      'Add streaming response support so the UI updates in real-time',
      'Implement conversation memory so the agent remembers context across turns',
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
    transcriptSummary: 'Covers advanced prompt engineering techniques optimized for Claude: XML tag structuring, chain-of-thought reasoning, few-shot prompting, system prompt design, and meta-prompting.',
    prompts: [
      'Analyze the following code for security vulnerabilities and best practice violations. Structure your response with XML tags.',
      'Solve this optimization problem step by step using chain-of-thought reasoning.',
    ],
    tags: ['Prompt Engineering', 'Claude', 'Best Practices'],
  },
];

const NEWS = [
  {
    id: 'news-1',
    title: 'Anthropic Launches Claude Code for Teams with Enterprise Features',
    source: 'TechCrunch',
    url: 'https://techcrunch.com',
    publishedAt: '2026-03-07T08:00:00Z',
    summary: 'Anthropic has released Claude Code for Teams, bringing the AI coding agent to enterprise environments with SSO integration, audit logging, and shared session management.',
    category: 'Claude',
  },
  {
    id: 'news-2',
    title: 'OpenAI Announces GPT-5 Turbo with Improved Reasoning',
    source: 'The Verge',
    url: 'https://theverge.com',
    publishedAt: '2026-03-06T14:30:00Z',
    summary: 'OpenAI has unveiled GPT-5 Turbo, a faster variant featuring improved mathematical reasoning, better code generation, and a 256K context window.',
    category: 'OpenAI',
  },
  {
    id: 'news-3',
    title: "Google DeepMind's Gemini 3.0 Sets New Scientific Benchmark Records",
    source: 'Ars Technica',
    url: 'https://arstechnica.com',
    publishedAt: '2026-03-05T11:00:00Z',
    summary: 'Gemini 3.0 claims state-of-the-art results on scientific reasoning benchmarks including GPQA Diamond and ScienceQA, with native multimodal generation.',
    category: 'AI Research',
  },
  {
    id: 'news-4',
    title: 'AI Coding Assistants Now Used by 78% of Professional Developers',
    source: 'Stack Overflow Blog',
    url: 'https://stackoverflow.blog',
    publishedAt: '2026-03-04T09:15:00Z',
    summary: "Stack Overflow's 2026 Developer Survey reveals 78% of developers now use AI coding assistants, up from 44% in 2024.",
    category: 'Industry',
  },
  {
    id: 'news-5',
    title: 'Open Claw AI Agent Framework Reaches 50K GitHub Stars',
    source: 'VentureBeat',
    url: 'https://venturebeat.com',
    publishedAt: '2026-03-03T16:45:00Z',
    summary: 'The open-source AI agent framework Open Claw has surpassed 50,000 GitHub stars with contributions from Anthropic, Meta, and the community.',
    category: 'Open Source',
  },
  {
    id: 'news-6',
    title: 'EU AI Act Enforcement Begins: What Developers Need to Know',
    source: 'Wired',
    url: 'https://wired.com',
    publishedAt: '2026-03-02T13:00:00Z',
    summary: "The EU AI Act's first enforcement provisions require mandatory risk assessments for high-risk AI systems and transparency obligations for generative AI.",
    category: 'Regulation',
  },
  {
    id: 'news-7',
    title: 'Microsoft Integrates Claude into VS Code as First-Party Extension',
    source: 'Bloomberg',
    url: 'https://bloomberg.com',
    publishedAt: '2026-03-01T10:30:00Z',
    summary: "Microsoft announced a first-party VS Code extension for Claude, allowing developers to use Anthropic's models alongside GitHub Copilot.",
    category: 'Industry',
  },
  {
    id: 'news-8',
    title: 'AI Agents Can Now Solve 85% of Real-World Software Engineering Tasks',
    source: 'MIT Technology Review',
    url: 'https://technologyreview.com',
    publishedAt: '2026-02-28T14:00:00Z',
    summary: 'New UC Berkeley research shows AI coding agents resolve 85% of real-world GitHub issues from SWE-bench Verified, up from 49% one year ago.',
    category: 'AI Research',
  },
];

function VideoCard({ video, isExpanded, onToggle }) {
  const fallbackSvg = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" rx="8" fill="#f0f4ff"/><text x="160" y="95" text-anchor="middle" fill="#667eea" font-size="40">&#9654;</text></svg>'
  );

  return (
    <div className="feed-video-card">
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="feed-video-thumbnail-link">
        <div className="feed-video-thumbnail-wrapper">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="feed-video-thumbnail"
            onError={(e) => { e.target.src = fallbackSvg; }}
          />
          <div className="feed-video-play-overlay">&#9654;</div>
        </div>
      </a>
      <div className="feed-video-body">
        <div className="feed-video-meta">
          <span className="feed-video-author">{video.author}</span>
          <span className="feed-video-date">{formatRelativeTime(video.published)}</span>
        </div>
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="feed-video-title-link">
          <h3 className="feed-video-title">{video.title}</h3>
        </a>
        <div className="feed-video-tags">
          {(video.tags || []).map(function(tag, i) {
            return <span key={i} className="feed-tag">{tag}</span>;
          })}
        </div>

        <p className="feed-video-description">{video.description}</p>

        <button className="feed-expand-btn" onClick={onToggle}>
          {isExpanded ? 'Hide Details' : 'Transcript Summary & Prompts'}
        </button>

        {isExpanded && (
          <div className="feed-video-expanded">
            {video.transcriptSummary && (
              <div className="feed-transcript-section">
                <h4>Transcript Summary</h4>
                <p>{video.transcriptSummary}</p>
              </div>
            )}

            {video.prompts && video.prompts.length > 0 ? (
              <div className="feed-prompts-section">
                <h4>Prompts Used</h4>
                <div className="feed-prompts-list">
                  {video.prompts.map(function(prompt, i) {
                    return (
                      <div key={i} className="feed-prompt-item">
                        <span className="feed-prompt-icon">&gt;</span>
                        <code className="feed-prompt-text">{prompt}</code>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="feed-prompts-section">
                <h4>Prompts Used</h4>
                <p className="feed-no-prompts">No specific prompts were identified in this video.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewsCard({ article }) {
  var categoryColor = CATEGORY_COLORS[article.category] || '#6b7280';
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="feed-news-card">
      <div className="feed-news-card-inner">
        <div className="feed-news-header">
          <span className="feed-news-category" style={{ background: categoryColor }}>
            {article.category}
          </span>
          <span className="feed-news-time">{formatRelativeTime(article.publishedAt)}</span>
        </div>
        <h3 className="feed-news-title">{article.title}</h3>
        <p className="feed-news-summary">{article.summary}</p>
        <div className="feed-news-footer">
          <span className="feed-news-source">{article.source}</span>
          <span className="feed-news-read-more">Read full article</span>
        </div>
      </div>
    </a>
  );
}

export default function MyFeedPage() {
  var videos = VIDEOS;
  var news = NEWS;
  var expandedVideo = null;
  var setExpandedVideo = function() {};
  var activeSection = 'all';
  var setActiveSection = function() {};
  var videoFilter = 'all';
  var setVideoFilter = function() {};

  try {
    var state1 = useState(null);
    expandedVideo = state1[0];
    setExpandedVideo = state1[1];

    var state2 = useState('all');
    activeSection = state2[0];
    setActiveSection = state2[1];

    var state3 = useState('all');
    videoFilter = state3[0];
    setVideoFilter = state3[1];
  } catch (err) {
    console.error('useState error:', err);
  }

  var allTags = [];
  for (var i = 0; i < videos.length; i++) {
    var tags = videos[i].tags || [];
    for (var j = 0; j < tags.length; j++) {
      if (allTags.indexOf(tags[j]) === -1) {
        allTags.push(tags[j]);
      }
    }
  }

  var filteredVideos = [];
  for (var k = 0; k < videos.length; k++) {
    if (videoFilter === 'all' || (videos[k].tags || []).indexOf(videoFilter) !== -1) {
      filteredVideos.push(videos[k]);
    }
  }

  return (
    <div className="feed-page">
      <div className="feed-section-tabs">
        <button
          className={'feed-section-tab' + (activeSection === 'all' ? ' active' : '')}
          onClick={function() { setActiveSection('all'); }}
        >
          All
        </button>
        <button
          className={'feed-section-tab' + (activeSection === 'videos' ? ' active' : '')}
          onClick={function() { setActiveSection('videos'); }}
        >
          YouTube Videos
        </button>
        <button
          className={'feed-section-tab' + (activeSection === 'news' ? ' active' : '')}
          onClick={function() { setActiveSection('news'); }}
        >
          AI News
        </button>
      </div>

      {(activeSection === 'all' || activeSection === 'videos') && (
        <section className="feed-section">
          <div className="feed-section-header">
            <h2>AI &amp; Claude Code Videos</h2>
            <p className="feed-section-subtitle">Latest videos about Claude Code, Open Claw, AI agents, and more</p>
          </div>

          <div className="feed-filter-bar">
            <button
              className={'feed-filter-chip' + (videoFilter === 'all' ? ' active' : '')}
              onClick={function() { setVideoFilter('all'); }}
            >
              All
            </button>
            {allTags.map(function(tag) {
              return (
                <button
                  key={tag}
                  className={'feed-filter-chip' + (videoFilter === tag ? ' active' : '')}
                  onClick={function() { setVideoFilter(tag); }}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="feed-video-grid">
            {filteredVideos.map(function(video) {
              return (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  isExpanded={expandedVideo === video.videoId}
                  onToggle={function() {
                    setExpandedVideo(expandedVideo === video.videoId ? null : video.videoId);
                  }}
                />
              );
            })}
          </div>

          {filteredVideos.length === 0 && (
            <div className="feed-empty">
              <p>No videos found for this filter.</p>
            </div>
          )}
        </section>
      )}

      {(activeSection === 'all' || activeSection === 'news') && (
        <section className="feed-section">
          <div className="feed-section-header">
            <h2>AI Daily News</h2>
            <p className="feed-section-subtitle">Stay up to date with AI, Claude, OpenAI, and industry news</p>
          </div>

          <div className="feed-news-grid">
            {news.map(function(article) {
              return <NewsCard key={article.id} article={article} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
