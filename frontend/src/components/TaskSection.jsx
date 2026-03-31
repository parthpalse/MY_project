import React from 'react';

const levelClass = (level = '') => {
  const l = level.toLowerCase();
  if (l.includes('hard')) return 'badge-hard';
  if (l.includes('medium')) return 'badge-medium';
  return 'badge-easy';
};

const TaskSection = ({ title, tasks, onToggle }) => {
  return (
    <div className="glass-card">
      <h3 className="section-title">{title}</h3>
      <div className="task-list">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`task-item ${task.done ? 'completed' : ''}`}
            onClick={() => onToggle(task.id)}
          >
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.done}
              onChange={(e) => { e.stopPropagation(); onToggle(task.id); }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="task-content">
              <span className="task-title">
                {task.url ? (
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.title} <span style={{ fontSize: '0.85rem' }}>🔗</span>
                  </a>
                ) : task.title}
                {task.skippedDays > 0 && (
                  <span className="task-skipped">({task.skippedDays}x skipped)</span>
                )}
              </span>

              {/* Topic + Level badges for DSA tasks */}
              {(task.topic || task.level) && (
                <div className="task-badges">
                  {task.topic && <span className="badge badge-topic">📌 {task.topic}</span>}
                  {task.level && <span className={`badge ${levelClass(task.level)}`}>{task.level}</span>}
                </div>
              )}

              {task.estimatedMinutes && (
                <span className="task-meta">⏱️ {task.estimatedMinutes} min</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSection;
