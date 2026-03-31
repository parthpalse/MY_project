const roadmap = {
  weeks: {
    '1':  { topics: ['Arrays', 'Strings'],             level: 'Easy' },
    '2':  { topics: ['Arrays', 'Hashing'],             level: 'Easy' },
    '3':  { topics: ['Strings', 'Basic Math'],         level: 'Easy' },
    '4':  { topics: ['Hashing', 'Mixed Easy'],         level: 'Easy' },
    '5':  { topics: ['Recursion', 'Linked List'],      level: 'Easy-Medium' },
    '6':  { topics: ['Stack', 'Queue'],                level: 'Easy-Medium' },
    '7':  { topics: ['Linked List', 'Recursion'],      level: 'Easy-Medium' },
    '8':  { topics: ['Stack', 'Queue', 'Mixed'],       level: 'Easy-Medium' },
    '9':  { topics: ['Two Pointers', 'Sliding Window'],level: 'Medium' },
    '10': { topics: ['Binary Search', 'Two Pointers'], level: 'Medium' },
    '11': { topics: ['Sliding Window', 'Hashing'],     level: 'Medium' },
    '12': { topics: ['Mixed Patterns', 'Review'],      level: 'Medium' }
  }
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateCompletion(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);
}

function getWeekInfo(firstEntryDate) {
  const start = new Date(firstEntryDate);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
  const week = String(Math.min(Math.ceil((diffDays + 1) / 7), 12));
  return roadmap.weeks[week] || roadmap.weeks['1'];
}

function isLowStreak(allEntries, minDays = 2) {
  const sorted = [...allEntries].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-minDays);
  if (recent.length < minDays) return false;
  return recent.every(e => (e.completion_rate || 0) < 50);
}

function generateTomorrowTasks(todayEntry, allEntries) {
  const firstDate = allEntries.length > 0
    ? [...allEntries].sort((a, b) => a.date.localeCompare(b.date))[0].date
    : todayEntry.date;

  const weekInfo = getWeekInfo(firstDate);
  const { topics, level } = weekInfo;
  const forceLight = isLowStreak(allEntries) || todayEntry.busy_day;

  const todayTasks = todayEntry.tasks_json || [];
  const tomorrow = [];

  const dsaTasks = todayTasks.filter(t => t.section === 'DSA');
  const dsaNotDone = dsaTasks.filter(t => !t.done);

  if (!forceLight) {
    dsaNotDone.slice(0, 3).forEach(t => {
      tomorrow.push({ ...t, id: generateId(), done: false, skippedDays: (t.skippedDays || 0) + 1 });
    });
    if (dsaNotDone.length === 0 && dsaTasks.length > 0) {
      tomorrow.push({ id: generateId(), section: 'DSA', title: `Next-Level: ${topics[0]}`, topic: topics[0], level, estimatedMinutes: 45, done: false });
    }
    if (tomorrow.filter(t => t.section === 'DSA').length < 3) {
      tomorrow.push({ id: generateId(), section: 'DSA', title: `Practice: ${topics[0]}`, topic: topics[0], level: 'Easy', estimatedMinutes: 25, done: false });
    }
  } else {
    tomorrow.push({ id: generateId(), section: 'DSA', title: `Light: ${topics[0]}`, topic: topics[0], level: 'Easy', estimatedMinutes: 20, done: false });
    tomorrow.push({ id: generateId(), section: 'DSA', title: `Light: ${topics[1] || topics[0]}`, topic: topics[1] || topics[0], level: 'Easy', estimatedMinutes: 20, done: false });
  }

  const finalDSA = tomorrow.filter(t => t.section === 'DSA').slice(0, 5);

  const projectTasks = todayTasks.filter(t => t.section === 'Project');
  const projectNotDone = projectTasks.filter(t => !t.done);
  const finalProject = [];

  if (!forceLight) {
    projectNotDone.slice(0, 2).forEach(t => {
      const skip = (t.skippedDays || 0) + 1;
      finalProject.push({ ...t, id: generateId(), done: false, skippedDays: skip,
        title: skip >= 2 ? `[MUST DO] ${t.title.replace('[MUST DO] ', '')}` : t.title });
    });
    if (finalProject.length === 0) {
      finalProject.push({ id: generateId(), section: 'Project', title: 'Next feature / bug fix', estimatedMinutes: 60, done: false });
    }
  }

  const extra = [{
    id: generateId(), section: 'Extra',
    title: forceLight ? '🎮 Light day — rest & recharge!' : 'Reflection / Resume / Networking',
    estimatedMinutes: 15, done: false
  }];

  return [...finalDSA, ...finalProject.slice(0, 2), ...extra];
}

function computeStats(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if ((sorted[i].tasks_json || []).some(t => t.done)) streak++;
    else break;
  }
  const last7 = sorted.slice(-7);
  const sevenDayAvg = last7.length === 0 ? 0
    : Math.round(last7.reduce((s, d) => s + (d.completion_rate || 0), 0) / last7.length);

  const topicCount = {};
  last7.forEach(e => {
    (e.tasks_json || []).filter(t => t.section === 'DSA' && t.done && t.topic).forEach(t => {
      topicCount[t.topic] = (topicCount[t.topic] || 0) + 1;
    });
  });
  return { streak, sevenDayAvg, topicCount };
}

const INITIAL_TASKS = [
  { id: 't1', section: 'DSA', title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', topic: 'Arrays', level: 'Easy', estimatedMinutes: 30, done: false },
  { id: 't2', section: 'DSA', title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', topic: 'Strings', level: 'Easy', estimatedMinutes: 30, done: false },
  { id: 't3', section: 'DSA', title: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', topic: 'Arrays', level: 'Easy', estimatedMinutes: 30, done: false },
  { id: 't4', section: 'Project', title: 'Small UI Improvement or Refactor', estimatedMinutes: 60, done: false },
  { id: 't5', section: 'Extra', title: 'Update Resume / Reflection', estimatedMinutes: 15, done: false }
];

module.exports = { calculateCompletion, generateTomorrowTasks, computeStats, INITIAL_TASKS };
