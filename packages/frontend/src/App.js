import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

import theme from './theme';

const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };
const PRIORITY_COLORS = { high: 'error', medium: 'warning', low: 'success' };

const EMPTY_FORM = { title: '', details: '', priority: '', due_date: '' };

function buildQueryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

function TaskFormDialog({ open, task, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(task
        ? { title: task.title, details: task.details || '', priority: task.priority || '', due_date: task.due_date || '' }
        : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, task]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    return newErrors;
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      title: form.title.trim(),
      details: form.details || null,
      priority: form.priority || null,
      due_date: form.due_date || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={handleChange('title')}
            required
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            inputProps={{ 'aria-label': 'Task title' }}
          />
          <TextField
            label="Details"
            value={form.details}
            onChange={handleChange('details')}
            multiline
            rows={3}
            fullWidth
            inputProps={{ 'aria-label': 'Task details' }}
          />
          <FormControl fullWidth>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              value={form.priority}
              onChange={handleChange('priority')}
              label="Priority"
              inputProps={{ 'aria-label': 'Task priority' }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={handleChange('due_date')}
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            inputProps={{ 'aria-label': 'Task due date' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {task ? 'Save Changes' : 'Add Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteConfirmDialog({ open, taskTitle, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Task</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>&quot;{taskTitle}&quot;</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  return (
    <ListItem
      divider
      sx={{ alignItems: 'flex-start', opacity: task.completed ? 0.7 : 1 }}
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit task">
            <IconButton
              edge="end"
              aria-label="Edit task"
              onClick={() => onEdit(task)}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete task">
            <IconButton
              edge="end"
              aria-label="Delete task"
              onClick={() => onDelete(task)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <Checkbox
        checked={!!task.completed}
        onChange={() => onToggleComplete(task)}
        inputProps={{ 'aria-label': `Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}` }}
        sx={{ pt: 0.5, pb: 0.5, mr: 1 }}
        color="success"
      />
      <ListItemText
        secondaryTypographyProps={{ component: 'div' }}
        primary={
          <Typography
            variant="body1"
            sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
          >
            {task.title}
          </Typography>
        }
        secondary={
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }} alignItems="center">
            {task.priority && (
              <Chip
                label={PRIORITY_LABELS[task.priority]}
                color={PRIORITY_COLORS[task.priority]}
                size="small"
              />
            )}
            {task.due_date && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <CalendarTodayIcon sx={{ fontSize: 12 }} aria-hidden="true" />
                {task.due_date}
              </Typography>
            )}
            {task.details && (
              <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mt: 0.5 }}>
                {task.details}
              </Typography>
            )}
          </Stack>
        }
      />
    </ListItem>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  const [actionInProgress, setActionInProgress] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const qs = buildQueryString({ search, status: filterStatus, priority: filterPriority, sort: sortBy });
      const response = await fetch(`/api/tasks${qs}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setTasks(result);
    } catch (err) {
      showSnackbar('Failed to load tasks: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPriority, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (formData) => {
    setActionInProgress(true);
    try {
      let response;
      if (editingTask) {
        response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save task');
      }
      setTaskDialogOpen(false);
      setEditingTask(null);
      await fetchTasks();
      showSnackbar(editingTask ? 'Task updated successfully' : 'Task added successfully');
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setActionInProgress(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to toggle completion');
      const updated = await response.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      showSnackbar(updated.completed ? 'Task marked as complete' : 'Task marked as incomplete');
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteClick = (task) => {
    setDeletingTask(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setActionInProgress(true);
    try {
      const response = await fetch(`/api/tasks/${deletingTask.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      setDeleteDialogOpen(false);
      setDeletingTask(null);
      await fetchTasks();
      showSnackbar('Task deleted successfully');
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 3, px: 2 }}>
          <Container maxWidth="md">
            <Typography variant="h4" component="h1">My Tasks</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Keep track of your tasks</Typography>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ mt: 3 }}>
          {/* Search and Filters */}
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, mb: 2, boxShadow: 1 }}>
            <Stack spacing={2}>
              <TextField
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon aria-hidden="true" />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear search"
                        size="small"
                        onClick={() => setSearch('')}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{ 'aria-label': 'Search tasks' }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <FilterListIcon color="action" aria-hidden="true" />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                    inputProps={{ 'aria-label': 'Filter by status' }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="priority-filter-label">Priority</InputLabel>
                  <Select
                    labelId="priority-filter-label"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                    inputProps={{ 'aria-label': 'Filter by priority' }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="sort-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    inputProps={{ 'aria-label': 'Sort tasks' }}
                  >
                    <MenuItem value="created_at">Date Created</MenuItem>
                    <MenuItem value="due_date">Due Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="completed">Completion Status</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          {/* Task List */}
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress aria-label="Loading tasks" />
              </Box>
            ) : tasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No tasks found. Start by adding a new task!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleAddTask}
                >
                  Add Task
                </Button>
              </Box>
            ) : (
              <List disablePadding aria-label="Task list">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </List>
            )}
          </Box>
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="Add task"
          onClick={handleAddTask}
          disabled={actionInProgress}
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
        >
          <AddIcon />
        </Fab>

        {/* Task Form Dialog */}
        <TaskFormDialog
          open={taskDialogOpen}
          task={editingTask}
          onClose={() => { setTaskDialogOpen(false); setEditingTask(null); }}
          onSave={handleSaveTask}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          taskTitle={deletingTask?.title || ''}
          onClose={() => { setDeleteDialogOpen(false); setDeletingTask(null); }}
          onConfirm={handleDeleteConfirm}
        />

        {/* Snackbar notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
