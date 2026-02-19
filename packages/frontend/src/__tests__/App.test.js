import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const SAMPLE_TASKS = [
  { id: 1, title: 'Buy groceries', details: 'Milk, eggs', completed: 0, priority: 'medium', due_date: null, created_at: '2023-01-01T00:00:00.000Z' },
  { id: 2, title: 'Read a book', details: null, completed: 0, priority: 'low', due_date: null, created_at: '2023-01-02T00:00:00.000Z' },
  { id: 3, title: 'Finish report', details: null, completed: 1, priority: 'high', due_date: '2024-12-31', created_at: '2023-01-03T00:00:00.000Z' },
];

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(SAMPLE_TASKS));
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }
    return res(ctx.status(201), ctx.json({
      id: 4,
      title,
      details: req.body.details || null,
      completed: 0,
      priority: req.body.priority || null,
      due_date: req.body.due_date || null,
      created_at: new Date().toISOString(),
    }));
  }),

  rest.put('/api/tasks/:id', (req, res, ctx) => {
    const { title } = req.body;
    const existing = SAMPLE_TASKS.find(t => t.id === parseInt(req.params.id));
    if (!existing) return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    return res(ctx.status(200), ctx.json({ ...existing, ...req.body, title: title || existing.title }));
  }),

  rest.patch('/api/tasks/:id/complete', (req, res, ctx) => {
    const existing = SAMPLE_TASKS.find(t => t.id === parseInt(req.params.id));
    if (!existing) return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    return res(ctx.status(200), ctx.json({ ...existing, completed: existing.completed ? 0 : 1 }));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: parseInt(req.params.id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  describe('Rendering', () => {
    test('renders the page title', async () => {
      await act(async () => { render(<App />); });
      expect(screen.getByText('My Tasks')).toBeInTheDocument();
    });

    test('shows loading spinner while fetching tasks', async () => {
      await act(async () => { render(<App />); });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('loads and displays tasks', async () => {
      await act(async () => { render(<App />); });
      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText('Read a book')).toBeInTheDocument();
        expect(screen.getByText('Finish report')).toBeInTheDocument();
      });
    });

    test('displays priority chips', async () => {
      await act(async () => { render(<App />); });
      await waitFor(() => {
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
      });
    });

    test('displays due date for tasks that have one', async () => {
      await act(async () => { render(<App />); });
      await waitFor(() => {
        expect(screen.getByText('2024-12-31')).toBeInTheDocument();
      });
    });

    test('renders add task FAB button', async () => {
      await act(async () => { render(<App />); });
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    test('shows empty state message and add button when no tasks', async () => {
      server.use(rest.get('/api/tasks', (req, res, ctx) => res(ctx.status(200), ctx.json([]))));
      await act(async () => { render(<App />); });
      await waitFor(() => {
        expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Adding tasks', () => {
    test('opens add task dialog when FAB is clicked', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

      const fab = screen.getByRole('button', { name: /add task/i });
      await act(async () => { await user.click(fab); });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    test('adds a new task successfully', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

      const fab = screen.getByRole('button', { name: /add task/i });
      await act(async () => { await user.click(fab); });

      const titleInput = screen.getByLabelText(/task title/i);
      await act(async () => { await user.type(titleInput, 'New Test Task'); });

      const addButton = screen.getByRole('button', { name: /add task/i, hidden: false });
      const dialogAddButton = within(screen.getByRole('dialog')).getByRole('button', { name: /add task/i });
      await act(async () => { await user.click(dialogAddButton); });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('shows validation error when title is empty', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /add task/i }));
      });

      const dialogAddButton = within(screen.getByRole('dialog')).getByRole('button', { name: /add task/i });
      await act(async () => { await user.click(dialogAddButton); });

      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  describe('Completing tasks', () => {
    test('toggles task completion when checkbox is clicked', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

      const checkboxes = screen.getAllByRole('checkbox');
      await act(async () => { await user.click(checkboxes[0]); });

      await waitFor(() => {
        expect(screen.getByText(/marked as/i)).toBeInTheDocument();
      });
    });
  });

  describe('Deleting tasks', () => {
    test('opens delete confirmation dialog', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
      await act(async () => { await user.click(deleteButtons[0]); });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
    });

    test('deletes task after confirmation', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
      await act(async () => { await user.click(deleteButtons[0]); });

      const confirmDeleteButton = within(screen.getByRole('dialog')).getByRole('button', { name: /delete/i });
      await act(async () => { await user.click(confirmDeleteButton); });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('cancels deletion when cancel is clicked', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
      await act(async () => { await user.click(deleteButtons[0]); });

      const cancelButton = within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i });
      await act(async () => { await user.click(cancelButton); });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Editing tasks', () => {
    test('opens edit dialog with task data', async () => {
      const user = userEvent.setup();
      await act(async () => { render(<App />); });
      await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

      const editButtons = screen.getAllByRole('button', { name: /edit task/i });
      await act(async () => { await user.click(editButtons[0]); });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Task')).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/task title/i);
      expect(titleInput.value).toBe('Buy groceries');
    });
  });

  describe('Error handling', () => {
    test('shows error snackbar on fetch failure', async () => {
      server.use(rest.get('/api/tasks', (req, res, ctx) => res(ctx.status(500))));
      await act(async () => { render(<App />); });
      await waitFor(() => {
        expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and filters', () => {
    test('renders search input', async () => {
      await act(async () => { render(<App />); });
      expect(screen.getByLabelText(/search tasks/i)).toBeInTheDocument();
    });

    test('renders filter and sort controls', async () => {
      await act(async () => { render(<App />); });
      expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort tasks/i)).toBeInTheDocument();
    });
  });
});
