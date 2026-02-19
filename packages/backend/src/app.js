const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Apply rate limiting to all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    details TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT NULL,
    due_date TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialTasks = [
  { title: 'Buy groceries', details: 'Milk, eggs, bread', priority: 'medium', due_date: null },
  { title: 'Read a book', details: null, priority: 'low', due_date: null },
  { title: 'Finish project report', details: 'Draft due by end of week', priority: 'high', due_date: null },
];

const insertStmt = db.prepare(
  'INSERT INTO tasks (title, details, priority, due_date) VALUES (?, ?, ?, ?)'
);

initialTasks.forEach(task => {
  insertStmt.run(task.title, task.details, task.priority, task.due_date);
});

console.log('In-memory database initialized with sample data');

// API Routes

// GET /api/tasks - return all tasks with optional search, filter, sort
app.get('/api/tasks', (req, res) => {
  try {
    const { search, status, priority, sort } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR details LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (status === 'active') {
      query += ' AND completed = 0';
    } else if (status === 'completed') {
      query += ' AND completed = 1';
    }

    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    const SORT_OPTIONS = {
      'due_date': 'due_date ASC',
      'priority': "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC",
      'created_at': 'created_at DESC',
      'completed': 'completed ASC',
    };

    const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS['created_at'];
    query += ` ORDER BY ${orderBy}`;

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - create a new task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, details, priority, due_date } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be high, medium, or low' });
    }

    const result = db.prepare(
      'INSERT INTO tasks (title, details, priority, due_date) VALUES (?, ?, ?, ?)'
    ).run(title.trim(), details || null, priority || null, due_date || null);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - update a task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, details, priority, due_date } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    if (priority !== undefined && priority !== null && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be high, medium, or low' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;
    const updatedDetails = details !== undefined ? details : existingTask.details;
    const updatedPriority = priority !== undefined ? priority : existingTask.priority;
    const updatedDueDate = due_date !== undefined ? due_date : existingTask.due_date;

    db.prepare(
      'UPDATE tasks SET title = ?, details = ?, priority = ?, due_date = ? WHERE id = ?'
    ).run(updatedTitle, updatedDetails, updatedPriority, updatedDueDate, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH /api/tasks/:id/complete - toggle task completion
app.patch('/api/tasks/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newCompleted = existingTask.completed ? 0 : 1;
    db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(newCompleted, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({ error: 'Failed to toggle task completion' });
  }
});

// DELETE /api/tasks/:id - delete a task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db };
