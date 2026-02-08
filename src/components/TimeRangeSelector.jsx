import React from 'react';

// Reusable time range selector component consistent across all pages
export default function TimeRangeSelector({ value, onChange, size = 'normal' }) {
  const options = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'mtd', label: 'MTD' },
    { value: 'ytd', label: 'YTD' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className={`time-range-selector ${size}`}>
      {options.map(option => (
        <button
          key={option.value}
          className={`time-range-btn ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
          title={option.label}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
