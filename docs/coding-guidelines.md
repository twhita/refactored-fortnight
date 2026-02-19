# Coding Guidelines

## Overview

This document describes the coding style and quality principles for the TODO application. Following these guidelines ensures that the codebase remains consistent, readable, and maintainable for all contributors.

---

## General Formatting

- Use **2 spaces** for indentation (no tabs).
- Keep lines to a maximum of **100 characters**.
- Always end files with a **single newline**.
- Remove trailing whitespace on all lines.
- Use **single quotes** for strings in JavaScript/TypeScript, unless the string contains a single quote.
- Always include **semicolons** at the end of statements.
- Use **camelCase** for variable and function names, **PascalCase** for classes and React components, and **UPPER_SNAKE_CASE** for constants.

---

## Import Organization

Imports should be grouped and ordered as follows, with a blank line between each group:

1. **Node.js built-in modules** (e.g., `path`, `fs`)
2. **Third-party packages** (e.g., `react`, `axios`)
3. **Internal project modules** (e.g., `../components/Button`, `./utils`)

Within each group, sort imports alphabetically. Avoid unused imports — remove them before committing.

```ts
// ✅ Good
import fs from 'fs';

import React, { useState } from 'react';

import { TaskList } from '../components/TaskList';
import { formatDate } from './utils';
```

---

## Linter Usage

This project uses **ESLint** with a shared configuration to enforce consistent code style and catch common errors automatically.

- Always run the linter before committing: `npm run lint`
- Fix all linter errors before opening a pull request. Warnings should be reviewed and resolved where practical.
- Do not disable ESLint rules inline (`// eslint-disable-next-line`) without a comment explaining why.
- The linter configuration is defined in the project root — do not modify it without team agreement.

---

## Code Quality Principles

### DRY (Don't Repeat Yourself)

Avoid duplicating logic across the codebase. If you find yourself writing the same code in more than one place, extract it into a shared utility function, custom hook, or service module. Duplication increases the risk of bugs and makes future changes harder to maintain.

### Single Responsibility

Each function, component, and module should have one clear purpose. If a function is doing too many things, break it into smaller, focused units. This makes code easier to test, debug, and reuse.

### Descriptive Naming

Choose names that clearly describe what a variable, function, or component does. Avoid abbreviations that are not widely understood. Well-named code reduces the need for explanatory comments.

### Avoid Magic Numbers and Strings

Replace hard-coded values with named constants. This makes the intent clear and simplifies future updates.

```ts
// ❌ Avoid
if (tasks.length > 100) { ... }

// ✅ Prefer
const MAX_TASK_COUNT = 100;
if (tasks.length > MAX_TASK_COUNT) { ... }
```

### Keep Functions Small

Functions should be short and focused — ideally no more than 20–30 lines. Long functions are harder to understand and test.

### Prefer Explicit Over Implicit

Write code that makes its intent obvious. Avoid clever shortcuts that are hard to follow. Future readers (including your future self) will thank you.

---

## Comments and Documentation

- Write comments to explain **why** something is done, not **what** is done — the code itself should make the "what" clear.
- Use JSDoc-style comments for exported functions and public APIs.
- Keep comments up to date when code changes. Outdated comments are worse than no comments.

---

## Version Control Hygiene

- Make small, focused commits with descriptive messages.
- Do not commit commented-out code or debug statements (e.g., `console.log`).
- All changes must pass linting and tests before being merged.
