import React, { useState, useEffect } from 'react';
import { fetchAIVideos, fetchAINews, formatRelativeTime, getCategoryColor } from '../services/feedService';

function VideoCard({ video, isExpanded, onToggle }) {
  return (
    <div className="feed-video-card">
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="feed-video-thumbnail-link">
        <div className="feed-video-thumbnail-wrapper">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="feed-video-thumbnail"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" fill="%23667eea"><rect width="320" height="180" rx="8" fill="%23f0f4ff"/><text x="160" y="90" text-anchor="middle" fill="%23667eea" font-size="40">▶</text></svg>'
              );
            }}
          />
          <div className="feed-video-play-overlay">▶</div>
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
          {video.tags.map((tag, i) => (
            <span key={i} className="feed-tag">{tag}</span>
          ))}
        </div>

        <p className="feed-video-description">{video.description}</p>

        <button className="feed-expand-btn" onClick={onToggle}>
          {isExpanded ? '▲ Hide Details' : '▼ Transcript Summary & Prompts'}
        </button>

        {isExpanded && (
          <div className="feed-video-expanded">
            {video.transcriptSummary && (
              <div className="feed-transcript-section">
                <h4>Transcript Summary</h4>
                <p>{video.transcriptSummary}</p>
              </div>
            )}

            {video.prompts && video.prompts.length > 0 && (
              <div className="feed-prompts-section">
                <h4>Prompts Used</h4>
                <div className="feed-prompts-list">
                  {video.prompts.map((prompt, i) => (
                    <div key={i} className="feed-prompt-item">
                      <span className="feed-prompt-icon">›</span>
                      <code className="feed-prompt-text">{prompt}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!video.prompts || video.prompts.length === 0) && (
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
  const categoryColor = getCategoryColor(article.category);
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
          <span className="feed-news-read-more">Read full article →</span>
        </div>
      </div>
    </a>
  );
}

export default function MyFeedPage() {
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [activeSection, setActiveSection] = useState('all');
  const [videoFilter, setVideoFilter] = useState('all');

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      const [videoData, newsData] = await Promise.all([
        fetchAIVideos(),
        fetchAINews(),
      ]);
      setVideos(videoData);
      setNews(newsData);
      setLoading(false);
    }
    loadFeed();
  }, []);

  const tagSet = [...new Set(videos.flatMap(v => v.tags))];

  const filteredVideos = videoFilter === 'all'
    ? videos
    : videos.filter(v => v.tags.includes(videoFilter));

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="feed-loading-spinner" />
        <p>Loading your feed...</p>
      </div>
    );
  }

  return (
    <div className="feed-page">
      {/* Section Tabs */}
      <div className="feed-section-tabs">
        <button
          className={`feed-section-tab ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
        >
          All
        </button>
        <button
          className={`feed-section-tab ${activeSection === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveSection('videos')}
        >
          YouTube Videos
        </button>
        <button
          className={`feed-section-tab ${activeSection === 'news' ? 'active' : ''}`}
          onClick={() => setActiveSection('news')}
        >
          AI News
        </button>
      </div>

      {/* YouTube Videos Section */}
      {(activeSection === 'all' || activeSection === 'videos') && (
        <section className="feed-section">
          <div className="feed-section-header">
            <h2>AI & Claude Code Videos</h2>
            <p className="feed-section-subtitle">Latest videos about Claude Code, Open Claw, AI agents, and more</p>
          </div>

          <div className="feed-filter-bar">
            <button
              className={`feed-filter-chip ${videoFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVideoFilter('all')}
            >
              All
            </button>
            {tagSet.map(tag => (
              <button
                key={tag}
                className={`feed-filter-chip ${videoFilter === tag ? 'active' : ''}`}
                onClick={() => setVideoFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="feed-video-grid">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.videoId}
                video={video}
                isExpanded={expandedVideo === video.videoId}
                onToggle={() => setExpandedVideo(
                  expandedVideo === video.videoId ? null : video.videoId
                )}
              />
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="feed-empty">
              <p>No videos found for this filter.</p>
            </div>
          )}
        </section>
      )}

      {/* AI News Section */}
      {(activeSection === 'all' || activeSection === 'news') && (
        <section className="feed-section">
          <div className="feed-section-header">
            <h2>AI Daily News</h2>
            <p className="feed-section-subtitle">Stay up to date with AI, Claude, OpenAI, and industry news</p>
          </div>

          <div className="feed-news-grid">
            {news.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
