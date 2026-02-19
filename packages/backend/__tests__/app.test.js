const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTask = async (fields = {}) => {
  const defaults = { title: 'Temp Task', priority: 'low', details: null, due_date: null };
  const response = await request(app)
    .post('/api/tasks')
    .send({ ...defaults, ...fields })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('created_at');
    });

    it('should filter by status=active', async () => {
      const response = await request(app).get('/api/tasks?status=active');
      expect(response.status).toBe(200);
      response.body.forEach(task => expect(task.completed).toBe(0));
    });

    it('should filter by status=completed', async () => {
      const task = await createTask({ title: 'Task to complete' });
      await request(app).patch(`/api/tasks/${task.id}/complete`);

      const response = await request(app).get('/api/tasks?status=completed');
      expect(response.status).toBe(200);
      response.body.forEach(t => expect(t.completed).toBe(1));
    });

    it('should filter by priority', async () => {
      await createTask({ title: 'High priority task', priority: 'high' });
      const response = await request(app).get('/api/tasks?priority=high');
      expect(response.status).toBe(200);
      response.body.forEach(task => expect(task.priority).toBe('high'));
    });

    it('should search by title', async () => {
      await createTask({ title: 'Unique search term XYZ' });
      const response = await request(app).get('/api/tasks?search=XYZ');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].title).toContain('XYZ');
    });

    it('should sort by priority', async () => {
      const response = await request(app).get('/api/tasks?sort=priority');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'Test Task', priority: 'high', details: 'Some details' };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.priority).toBe(newTask.priority);
      expect(response.body.details).toBe(newTask.details);
      expect(response.body.completed).toBe(0);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create a task with minimal fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Minimal Task' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Minimal Task');
      expect(response.body.priority).toBeNull();
      expect(response.body.details).toBeNull();
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', priority: 'urgent' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Priority must be high, medium, or low');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const task = await createTask({ title: 'Original Title' });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated Title', priority: 'high', details: 'Updated details' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.priority).toBe('high');
      expect(response.body.details).toBe('Updated details');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/999999')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 if title is empty string', async () => {
      const task = await createTask({ title: 'Task' });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task title cannot be empty');
    });

    it('should return 400 for invalid priority', async () => {
      const task = await createTask({ title: 'Task' });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ priority: 'urgent' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Priority must be high, medium, or low');
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should toggle task completion from incomplete to complete', async () => {
      const task = await createTask({ title: 'Task to complete' });
      expect(task.completed).toBe(0);

      const response = await request(app).patch(`/api/tasks/${task.id}/complete`);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    it('should toggle task completion from complete to incomplete', async () => {
      const task = await createTask({ title: 'Task to uncomplete' });
      await request(app).patch(`/api/tasks/${task.id}/complete`);

      const response = await request(app).patch(`/api/tasks/${task.id}/complete`);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(0);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).patch('/api/tasks/999999/complete');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).patch('/api/tasks/abc/complete');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid task ID is required');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask({ title: 'Task To Be Deleted' });

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/tasks/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid task ID is required');
    });
  });
});
