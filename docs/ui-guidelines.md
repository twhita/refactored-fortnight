# UI Guidelines

## Overview

This document defines the core UI guidelines for the TODO application. All frontend development must adhere to these standards to ensure a consistent, accessible, and visually cohesive user experience.

## Component Library

### Material UI (MUI)

The application uses [Material UI (MUI)](https://mui.com/) as its primary component library. Developers must:

- Use MUI components instead of raw HTML elements wherever a MUI equivalent exists.
- Follow Material Design principles for layout, spacing, and interaction patterns.
- Avoid mixing third-party component libraries with MUI components.

**Recommended MUI components by use case:**

| Use Case | MUI Component |
|---|---|
| Page layout | `Container`, `Box`, `Stack`, `Grid` |
| Task list | `List`, `ListItem`, `ListItemText` |
| Task input | `TextField`, `InputAdornment` |
| Actions | `Button`, `IconButton`, `Fab` |
| Checkboxes | `Checkbox` |
| Dialogs / confirmations | `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` |
| Status messages | `Snackbar`, `Alert` |
| Loading states | `CircularProgress`, `LinearProgress` |
| Priority indicators | `Chip` |
| Date pickers | `DatePicker` (from `@mui/x-date-pickers`) |

---

## Color Palette

The application uses a fixed color palette based on MUI theming. Colors should not be defined with raw hex or RGB values in component code—use theme tokens instead.

### Primary Colors

| Token | Value | Usage |
|---|---|---|
| `primary.main` | `#1976D2` (Blue 700) | Primary actions, active states, links |
| `primary.light` | `#42A5F5` (Blue 400) | Hover states, highlights |
| `primary.dark` | `#1565C0` (Blue 800) | Pressed states |
| `primary.contrastText` | `#FFFFFF` | Text on primary-colored backgrounds |

### Secondary Colors

| Token | Value | Usage |
|---|---|---|
| `secondary.main` | `#9C27B0` (Purple 600) | Secondary actions, accents |
| `secondary.light` | `#BA68C8` | Hover states for secondary |
| `secondary.dark` | `#7B1FA2` | Pressed states for secondary |
| `secondary.contrastText` | `#FFFFFF` | Text on secondary-colored backgrounds |

### Status / Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `success.main` | `#2E7D32` (Green 800) | Completed tasks, success messages |
| `warning.main` | `#ED6C02` (Orange 700) | Medium priority, warnings |
| `error.main` | `#D32F2F` (Red 700) | High priority, errors, destructive actions |
| `info.main` | `#0288D1` (Light Blue 700) | Informational messages |

### Neutral / Surface Colors

| Token | Value | Usage |
|---|---|---|
| `background.default` | `#F5F5F5` | Page background |
| `background.paper` | `#FFFFFF` | Card and list surfaces |
| `text.primary` | `#212121` | Main body text |
| `text.secondary` | `#757575` | Secondary labels, helper text |
| `divider` | `#E0E0E0` | Dividers between list items |

### Priority Color Mapping

| Priority | Color Token | MUI `Chip` color |
|---|---|---|
| High | `error.main` | `color="error"` |
| Medium | `warning.main` | `color="warning"` |
| Low | `success.main` | `color="success"` |

---

## Typography

The application uses the MUI default typography scale based on the **Roboto** font family.

| Variant | Usage |
|---|---|
| `h4` | Page title (e.g., "My Tasks") |
| `h6` | Section headings |
| `body1` | Task titles, primary content |
| `body2` | Task details, secondary text |
| `caption` | Due dates, metadata labels |
| `button` | Button labels (handled automatically by MUI) |

Do not override font sizes or families in component styles. Use `variant` props and the MUI theme for typography customization.

---

## Button Styles

All interactive buttons must use MUI `Button` or `IconButton` components.

### Variants

| Variant | When to Use |
|---|---|
| `contained` | Primary action (e.g., "Add Task", "Save") |
| `outlined` | Secondary action (e.g., "Cancel", "Edit") |
| `text` | Tertiary or inline action (e.g., "Clear All") |

### Colors

| Use Case | Color |
|---|---|
| Positive / primary actions | `color="primary"` |
| Destructive actions (delete) | `color="error"` |
| Neutral actions | default (inherits) |

### Sizing

- Use `size="medium"` (default) for standard actions.
- Use `size="small"` for actions within compact list items or table rows.
- Use `size="large"` for primary call-to-action buttons in empty states.

### Floating Action Button (FAB)

Use a `Fab` component with `color="primary"` and an `Add` icon for the primary task creation action on mobile layouts.

### Destructive Actions

Destructive actions (e.g., deleting a task) must:
1. Use `color="error"` on the button.
2. Display a confirmation `Dialog` before executing the action.

---

## Spacing and Layout

- Use MUI `spacing` tokens (multiples of 8px) for all margins and padding.
- Do not use arbitrary pixel values in inline styles.
- Use `Box`, `Stack`, or `Grid` for layout composition.
- Minimum touch target size: **44×44px** for all interactive elements.

---

## Accessibility Requirements

All UI components must meet **WCAG 2.1 Level AA** standards.

### Color Contrast

- Normal text: minimum contrast ratio of **4.5:1** against its background.
- Large text (≥18pt or ≥14pt bold): minimum contrast ratio of **3:1**.
- UI component boundaries and icons: minimum contrast ratio of **3:1**.

### Keyboard Navigation

- All interactive elements must be reachable and operable via keyboard.
- Focus indicators must be clearly visible (do not suppress `:focus` or `:focus-visible` outlines).
- Logical focus order must follow the visual reading order.

### Screen Reader Support

- All form inputs must have associated `label` elements or `aria-label` attributes.
- Icon-only buttons must include an `aria-label` describing the action (e.g., `aria-label="Delete task"`).
- Dynamic content changes (e.g., task added/deleted) must be announced via `aria-live` regions or MUI `Snackbar`.
- Images and decorative icons must use `aria-hidden="true"`.

### Semantic HTML

- Use MUI components that render semantic HTML (e.g., `Button` renders `<button>`, `TextField` renders `<input>`).
- Use list elements (`List` / `ListItem`) for task lists to convey structure to assistive technologies.

### Reduced Motion

- Respect the `prefers-reduced-motion` media query. Avoid animations that could trigger vestibular disorders.
- MUI animations are disabled automatically when this preference is set if the theme is configured accordingly.

---

## Responsive Design

- The application must be usable on screen widths from **320px** to **1920px**.
- Use MUI `Grid` breakpoints for responsive layouts:
  - `xs` (0–599px): single-column, full-width layout.
  - `sm` (600–899px): condensed two-column layout where appropriate.
  - `md`+ (900px+): standard desktop layout with sidebar or multi-column task view.
- Avoid fixed-width containers that prevent the layout from adapting to small screens.

---

## Iconography

- Use icons from the [`@mui/icons-material`](https://mui.com/material-ui/material-icons/) package.
- Do not mix icon libraries (e.g., FontAwesome with MUI icons).
- Provide meaningful `aria-label` or `title` for all standalone icons.

**Common icon mappings:**

| Action | Icon |
|---|---|
| Add task | `AddIcon` |
| Delete task | `DeleteIcon` |
| Edit task | `EditIcon` |
| Mark complete | `CheckCircleIcon` / `RadioButtonUncheckedIcon` |
| High priority | `PriorityHighIcon` |
| Due date | `CalendarTodayIcon` |
| Search | `SearchIcon` |
| Filter | `FilterListIcon` |

---

## Forms and Validation

- Use MUI `TextField` for all text inputs.
- Display inline validation errors using the `error` and `helperText` props on `TextField`.
- Required fields must be marked with an asterisk (`required` prop on `TextField`).
- Validation feedback must appear on field blur or on form submission attempt, not while the user is typing.

---

## Loading and Empty States

- Show a `CircularProgress` spinner centered in the task list area while tasks are loading.
- Display a descriptive empty-state message and a prominent "Add Task" `Button` when the task list is empty.
- Disable action buttons while an async operation is in progress to prevent duplicate submissions.
