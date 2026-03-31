import React, { useEffect, useState } from 'react';
import { getHistory, getStats } from '../api';

const FILTERS = [
  { label: 'All Days', value: 'all' },
  { label: '≥80% ✅', value: 'good' },
  { label: '<50% ⚠️',  value: 'low' },
];

const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHistory(), getStats()])
      .then(([hist, st]) => { setHistory(hist); setStats(st); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCompletionClass = (rate) => {
    if (rate >= 80) return 'completion-high';
    if (rate >= 50) return 'completion-mid';
    return 'completion-low';
  };

  const filtered = history.filter(d => {
    if (filter === 'good') return d.completionRate >= 80;
    if (filter === 'low')  return d.completionRate < 50;
    return true;
  });

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading archives...</div>;

  return (
    <div className="history-view">
      <h2 style={{ marginBottom: '1.5rem' }}>Past Missions</h2>

      {/* Weekly topic summary */}
      {stats && (
        <div className="weekly-summary glass-card">
          <h3>📊 Last 7 Days — Topic Breakdown</h3>
          {Object.keys(stats.topicCount || {}).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No completed DSA problems logged yet.</p>
          ) : (
            Object.entries(stats.topicCount)
              .sort(([, a], [, b]) => b - a)
              .map(([topic, count]) => (
                <div className="topic-bar" key={topic}>
                  <span><strong>{topic}</strong></span>
                  <span>{count} problem{count !== 1 ? 's' : ''} solved</span>
                </div>
              ))
          )}
          {stats && Object.keys(stats.topicCount || {}).length > 0 && (() => {
            const all = ['Arrays', 'Strings', 'Hashing', 'Recursion', 'Linked List', 'Stack', 'Queue'];
            const missing = all.filter(t => !stats.topicCount[t]);
            return missing.length > 0 ? (
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#f59e0b' }}>
                ⚠️ No practice yet in: {missing.join(', ')}
              </p>
            ) : null;
          })()}
        </div>
      )}

      {/* Filter bar */}
      <div className="history-filter">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
          {filtered.length} day{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No days match this filter.</p>
      ) : (
        <div className="history-grid">
          {filtered.map(day => (
            <div key={day.date} className="glass-card history-card">
              <div className="history-date">{day.date}</div>
              {day.busyDay && (
                <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>😓 Busy Day</span>
              )}
              <div className={`history-completion ${getCompletionClass(day.completionRate)}`}>
                {day.completionRate}% Done
              </div>
              {day.notes && (() => {
                const note = typeof day.notes === 'object' ? day.notes.worked : day.notes;
                return note ? (
                  <div style={{ marginTop: '0.4rem', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    "{note.length > 55 ? note.substring(0, 55) + '...' : note}"
                  </div>
                ) : null;
              })()}
              <div className="history-tasks-preview" style={{ marginTop: '0.5rem' }}>
                DSA: {day.tasks.filter(t => t.section === 'DSA').length} •
                Project: {day.tasks.filter(t => t.section === 'Project').length} •
                Extra: {day.tasks.filter(t => t.section === 'Extra').length}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
