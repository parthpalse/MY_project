const express = require('express');
const router = express.Router();
const { format, addDays } = require('date-fns');
const db = require('../db');
const auth = require('../middleware/auth');
const { calculateCompletion, generateTomorrowTasks, computeStats, INITIAL_TASKS } = require('../ruleEngine');

// All routes require auth
router.use(auth);

// ── GET /api/entries/today ──────────────────────────────────
router.get('/today', async (req, res) => {
  const userId = req.user.id;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  try {
    let result = await db.query(
      'SELECT * FROM day_entries WHERE user_id = $1 AND date = $2',
      [userId, todayStr]
    );

    if (result.rows.length > 0) {
      return res.json(normalizeEntry(result.rows[0]));
    }

    // Auto-generate from previous day or use Day 1 template
    const history = await db.query(
      'SELECT * FROM day_entries WHERE user_id = $1 ORDER BY date ASC',
      [userId]
    );

    let newTasks;
    if (history.rows.length === 0) {
      newTasks = INITIAL_TASKS;
    } else {
      const lastEntry = history.rows[history.rows.length - 1];
      newTasks = generateTomorrowTasks(lastEntry, history.rows);
    }

    const insertResult = await db.query(
      `INSERT INTO day_entries (user_id, date, tasks_json, notes_json, completion_rate, busy_day)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, todayStr, JSON.stringify(newTasks), JSON.stringify({ blocked: '', worked: '', change: '' }), 0, false]
    );

    res.status(201).json(normalizeEntry(insertResult.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch today entry' });
  }
});

// ── PUT /api/entries/today ──────────────────────────────────
router.put('/today', async (req, res) => {
  const userId = req.user.id;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { tasks, notes, busyDay } = req.body;

  try {
    const completionRate = calculateCompletion(tasks);
    const result = await db.query(
      `UPDATE day_entries
       SET tasks_json = $1, notes_json = $2, completion_rate = $3, busy_day = $4
       WHERE user_id = $5 AND date = $6
       RETURNING *`,
      [JSON.stringify(tasks), JSON.stringify(notes), completionRate, !!busyDay, userId, todayStr]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Today entry not found' });

    res.json(normalizeEntry(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// ── POST /api/entries/end-day ───────────────────────────────
router.post('/end-day', async (req, res) => {
  const userId = req.user.id;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  try {
    // Recalculate and save today's completion
    const todayResult = await db.query(
      'SELECT * FROM day_entries WHERE user_id = $1 AND date = $2',
      [userId, todayStr]
    );
    if (todayResult.rows.length === 0)
      return res.status(404).json({ error: 'Today entry not found' });

    const todayEntry = todayResult.rows[0];
    const completionRate = calculateCompletion(todayEntry.tasks_json);
    await db.query(
      'UPDATE day_entries SET completion_rate = $1 WHERE user_id = $2 AND date = $3',
      [completionRate, userId, todayStr]
    );

    // Check if tomorrow already exists
    const tmrCheck = await db.query(
      'SELECT id FROM day_entries WHERE user_id = $1 AND date = $2',
      [userId, tomorrowStr]
    );
    if (tmrCheck.rows.length > 0)
      return res.json({ success: true, message: 'Tomorrow already exists' });

    // Generate tomorrow's tasks
    const allEntries = await db.query(
      'SELECT * FROM day_entries WHERE user_id = $1 ORDER BY date ASC',
      [userId]
    );
    const tomorrowTasks = generateTomorrowTasks(todayEntry, allEntries.rows);

    const tomorrowResult = await db.query(
      `INSERT INTO day_entries (user_id, date, tasks_json, notes_json, completion_rate, busy_day)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, tomorrowStr, JSON.stringify(tomorrowTasks), JSON.stringify({ blocked: '', worked: '', change: '' }), 0, false]
    );

    res.json({ success: true, tomorrowEntry: normalizeEntry(tomorrowResult.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end day' });
  }
});

// ── GET /api/entries/history ────────────────────────────────
router.get('/history', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      'SELECT * FROM day_entries WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows.map(normalizeEntry));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ── GET /api/entries/stats ──────────────────────────────────
router.get('/stats', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      'SELECT * FROM day_entries WHERE user_id = $1 ORDER BY date ASC',
      [userId]
    );
    res.json(computeStats(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Normalize DB row → frontend shape
function normalizeEntry(row) {
  return {
    id: row.id,
    date: typeof row.date === 'object' ? row.date.toISOString().split('T')[0] : row.date,
    tasks: row.tasks_json || [],
    notes: row.notes_json || { blocked: '', worked: '', change: '' },
    completionRate: row.completion_rate || 0,
    busyDay: row.busy_day || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = router;
