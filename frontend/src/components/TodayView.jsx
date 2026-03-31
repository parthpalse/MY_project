import React, { useEffect, useState } from 'react';
import { getTodayEntry, updateTodayEntry, endDay } from '../api';
import TaskSection from './TaskSection';
import NightlyReport from './NightlyReport';

const TodayView = ({ onDayEnd }) => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localNotes, setLocalNotes] = useState({ blocked: '', worked: '', change: '' });

  useEffect(() => {
    loadToday();
  }, []);

  const loadToday = async () => {
    try {
      const data = await getTodayEntry();
      setEntry(data);
      const n = data.notes;
      if (n && typeof n === 'object') {
        setLocalNotes({ blocked: n.blocked || '', worked: n.worked || '', change: n.change || '' });
      } else {
        setLocalNotes({ blocked: n || '', worked: '', change: '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const syncUpdate = async (updatedEntry) => {
    setEntry(updatedEntry);
    try {
      await updateTodayEntry(updatedEntry);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = (taskId) => {
    if (!entry) return;
    const updatedTasks = entry.tasks.map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    syncUpdate({ ...entry, tasks: updatedTasks });
  };

  const handleNoteBlur = () => {
    if (!entry) return;
    syncUpdate({ ...entry, notes: localNotes });
  };

  const handleBusyToggle = () => {
    if (!entry) return;
    syncUpdate({ ...entry, busyDay: !entry.busyDay });
  };

  const handleEndDay = async () => {
    if (!confirm('End day and generate tomorrow\'s tasks?')) return;
    try {
      await updateTodayEntry({ ...entry, notes: localNotes });
      await endDay();
      alert('Day ended! Tomorrow has been generated. 🚀');
      if (onDayEnd) onDayEnd();
    } catch (e) {
      console.error(e);
      alert('Error ending day');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Initializing Engine...</div>;
  if (!entry) return <div>No tasks for today.</div>;

  const dsaTasks = entry.tasks.filter(t => t.section === 'DSA');
  const projectTasks = entry.tasks.filter(t => t.section === 'Project');
  const extraTasks = entry.tasks.filter(t => t.section === 'Extra');

  return (
    <div className="today-view">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>
            Mission Data: <span style={{ color: 'var(--text-muted)' }}>{entry.date}</span>
          </h2>
          {entry.busyDay && (
            <span style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '0.2rem', display: 'block' }}>
              ⚡ Busy Day mode — lighter load active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className={`btn-busy ${entry.busyDay ? 'active' : ''}`}
            onClick={handleBusyToggle}
          >
            {entry.busyDay ? '😓 Busy Day ON' : '⚡ Mark Busy Day'}
          </button>
          <div style={{ padding: '0.4rem 1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '20px', color: 'var(--accent)', fontWeight: 600 }}>
            {entry.completionRate || 0}% Done
          </div>
        </div>
      </div>

      {dsaTasks.length > 0 && (
        <TaskSection title="🧠 Algorithms (DSA)" tasks={dsaTasks} onToggle={handleToggleTask} />
      )}
      {projectTasks.length > 0 && (
        <TaskSection title="🛠️ Project Development" tasks={projectTasks} onToggle={handleToggleTask} />
      )}
      {extraTasks.length > 0 && (
        <TaskSection title="✨ Extra / Maintenance" tasks={extraTasks} onToggle={handleToggleTask} />
      )}

      {/* Structured Reflection */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 className="section-title">📝 End-of-Day Reflection</h3>
        <div className="reflection-prompts">
          <div className="reflection-prompt">
            <label>🚧 What blocked you today?</label>
            <textarea
              value={localNotes.blocked}
              onChange={(e) => setLocalNotes(n => ({ ...n, blocked: e.target.value }))}
              onBlur={handleNoteBlur}
              placeholder="Time, concept confusion, environment issues..."
            />
          </div>
          <div className="reflection-prompt">
            <label>✅ What worked well?</label>
            <textarea
              value={localNotes.worked}
              onChange={(e) => setLocalNotes(n => ({ ...n, worked: e.target.value }))}
              onBlur={handleNoteBlur}
              placeholder="Solved faster than expected, understood a pattern..."
            />
          </div>
          <div className="reflection-prompt">
            <label>🔄 What will you change tomorrow?</label>
            <textarea
              value={localNotes.change}
              onChange={(e) => setLocalNotes(n => ({ ...n, change: e.target.value }))}
              onBlur={handleNoteBlur}
              placeholder="Start earlier, skip harder problems first..."
            />
          </div>
        </div>
      </div>

      {/* Nightly AI report */}
      <NightlyReport entry={entry} />

      <button className="btn-primary" onClick={handleEndDay}>
        🚀 End Day & Generate Tomorrow
      </button>
    </div>
  );
};

export default TodayView;
