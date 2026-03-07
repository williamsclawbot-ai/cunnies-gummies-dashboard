import React, { useState } from 'react';
import { fetchAIVideos, fetchAINews, formatRelativeTime, getCategoryColor } from '../services/feedService';

const videos = fetchAIVideos();
const news = fetchAINews();

export default function MyFeedPage() {
  const [section, setSection] = useState('videos');
  const [expandedCard, setExpandedCard] = useState(null);
  const [filter, setFilter] = useState('All');

  const allTags = ['All', ...new Set(videos.flatMap(v => v.tags))];
  const filteredVideos = filter === 'All' ? videos : videos.filter(v => v.tags.includes(filter));

  return (
    <div className="feed-page">
      <div className="feed-section-tabs">
        <button
          className={`feed-section-tab ${section === 'videos' ? 'active' : ''}`}
          onClick={() => setSection('videos')}
        >
          AI Videos
        </button>
        <button
          className={`feed-section-tab ${section === 'news' ? 'active' : ''}`}
          onClick={() => setSection('news')}
        >
          AI News
        </button>
      </div>

      {section === 'videos' && (
        <div className="feed-section">
          <div className="feed-section-header">
            <h2>AI Videos</h2>
            <p className="feed-section-subtitle">Latest AI, coding, and tech videos</p>
          </div>

          <div className="feed-filter-bar">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`feed-filter-chip ${filter === tag ? 'active' : ''}`}
                onClick={() => setFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="feed-video-grid">
            {filteredVideos.map(video => (
              <div key={video.videoId} className="feed-video-card">
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="feed-video-thumbnail-link">
                  <div className="feed-video-thumbnail-wrapper">
                    <img src={video.thumbnail} alt={video.title} className="feed-video-thumbnail" />
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
                    {video.tags.map(tag => (
                      <span key={tag} className="feed-tag">{tag}</span>
                    ))}
                  </div>
                  <p className="feed-video-description">{video.description}</p>

                  {video.transcriptSummary && (
                    <button
                      className="feed-expand-btn"
                      onClick={() => setExpandedCard(expandedCard === video.videoId ? null : video.videoId)}
                    >
                      {expandedCard === video.videoId ? 'Show less' : 'Show summary & prompts'}
                    </button>
                  )}

                  {expandedCard === video.videoId && (
                    <div className="feed-video-expanded">
                      <div className="feed-transcript-section">
                        <h4>Summary</h4>
                        <p>{video.transcriptSummary}</p>
                      </div>
                      {video.prompts && video.prompts.length > 0 && (
                        <div className="feed-prompts-section">
                          <h4>Prompts from this video</h4>
                          <div className="feed-prompts-list">
                            {video.prompts.map((prompt, i) => (
                              <div key={i} className="feed-prompt-item">
                                <span className="feed-prompt-icon">&gt;</span>
                                <span className="feed-prompt-text">{prompt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'news' && (
        <div className="feed-section">
          <div className="feed-section-header">
            <h2>AI News</h2>
            <p className="feed-section-subtitle">Daily AI industry updates</p>
          </div>
          <div className="feed-news-grid">
            {news.map(item => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="feed-news-card">
                <div className="feed-news-card-inner">
                  <div className="feed-news-header">
                    <span className="feed-news-category" style={{ background: getCategoryColor(item.category) }}>
                      {item.category}
                    </span>
                    <span className="feed-news-time">{formatRelativeTime(item.publishedAt)}</span>
                  </div>
                  <h3 className="feed-news-title">{item.title}</h3>
                  <p className="feed-news-summary">{item.summary}</p>
                  <div className="feed-news-footer">
                    <span className="feed-news-source">{item.source}</span>
                    <span className="feed-news-read-more">Read more</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
