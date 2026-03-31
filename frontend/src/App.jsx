import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodayView from './components/TodayView';
import HistoryView from './components/HistoryView';
import { getStats } from './api';
import './index.css';

function Planner({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('today');
  const [stats, setStats] = useState({ streak: 0, sevenDayAvg: 0 });

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, [activeTab]);

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <h1>⚡ Daily Engine</h1>
          <div className="header-stats">
            <span className="stat-pill stat-streak">🔥 Streak: {stats.streak} day{stats.streak !== 1 ? 's' : ''}</span>
            <span className="stat-pill stat-avg">📈 7-day avg: {stats.sevenDayAvg}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="nav-tabs">
            <button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Today</button>
            <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 {user.name}</div>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>
        {activeTab === 'today' && <TodayView onDayEnd={() => setActiveTab('history')} />}
        {activeTab === 'history' && <HistoryView />}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('de_user')); } catch { return null; }
  });

  const handleAuth = ({ token, user }) => {
    localStorage.setItem('de_token', token);
    localStorage.setItem('de_user', JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('de_token');
    localStorage.removeItem('de_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={!user ? <LoginPage onAuth={handleAuth} />    : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage onAuth={handleAuth} /> : <Navigate to="/" />} />
        <Route path="/*"        element={user  ? <Planner user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
