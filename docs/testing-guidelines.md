# Testing Guidelines

## Overview

This document defines the testing strategy and requirements for the TODO application. All contributors must follow these guidelines to ensure code quality, prevent regressions, and maintain a reliable application.

## Testing Requirements

### General Principles

- All new features must include appropriate tests before being merged.
- Tests must be maintained alongside the code they cover — when code changes, tests must be updated accordingly.
- Tests should be readable, focused, and independently runnable.
- Avoid testing implementation details; prefer testing observable behavior.
- Aim for meaningful coverage, not just high coverage numbers.

---

## Test Types

### Unit Tests

Unit tests verify individual functions, components, or modules in isolation.

**Requirements:**
- Every utility function and service module must have unit tests.
- React components must have unit tests for their rendering logic and user interactions.
- Business logic (e.g., task filtering, sorting, validation) must be unit tested.
- Mocks and stubs should be used to isolate the unit under test from external dependencies.

**Tooling:**
- Use [Jest](https://jestjs.io/) as the test runner.
- Use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component tests.

**Example coverage areas:**
- Task creation, editing, and deletion logic
- Input validation functions
- Sorting and filtering algorithms
- Individual UI components (rendering, props, interactions)

---

### Integration Tests

Integration tests verify that multiple units work correctly together, including interactions with APIs, databases, or other services.

**Requirements:**
- API routes must have integration tests covering success and error cases.
- Database interactions (create, read, update, delete) must be tested against a real or in-memory database.
- Frontend-to-backend integration flows (e.g., creating a task via the UI and verifying persistence) must be covered.

**Tooling:**
- Use [Jest](https://jestjs.io/) or [Supertest](https://github.com/ladjs/supertest) for API integration tests.
- Use an in-memory database or test database instance (not the production database).

**Example coverage areas:**
- REST API endpoints (POST /tasks, GET /tasks, PUT /tasks/:id, DELETE /tasks/:id)
- Data persistence and retrieval flows
- Error handling for invalid inputs or missing resources

---

### End-to-End (E2E) Tests

End-to-end tests simulate real user interactions with the fully running application to validate complete user flows.

**Requirements:**
- Core user workflows must have E2E tests.
- E2E tests must run against a deployed or locally running instance of the application.
- E2E tests should be stable and not rely on timing-based waits.

**Tooling:**
- Use [Playwright](https://playwright.dev/) for end-to-end testing.

**Example coverage areas:**
- Creating, editing, and deleting a task
- Marking a task as complete and incomplete
- Filtering and sorting the task list
- Searching for a task by title
- Responsive behavior across screen sizes

---

## Test Maintainability

- Group related tests using `describe` blocks for clarity.
- Use descriptive test names that explain the expected behavior (e.g., `"should mark a task as complete when the checkbox is clicked"`).
- Keep test setup DRY by using `beforeEach`/`afterEach` hooks or shared fixtures.
- Avoid hard-coding test data — use factory functions or fixtures to generate test data.
- Remove or update tests when associated features are removed or changed.
- Do not commit skipped or disabled tests without a clear explanation in a comment.

---

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all unit and integration tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:coverage` | Run tests with coverage report |

All tests must pass before a pull request can be merged.
