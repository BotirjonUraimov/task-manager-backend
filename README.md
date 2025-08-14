## Task Backend (Node.js, Express, TypeScript, Mongoose)

This is a clean, TypeScript-first REST API for managing tasks and users with role-based access control and JWT authentication. It includes Swagger docs, structured logging, and analytics for tasks.

### Tech stack

- Node.js + TypeScript
- Express 5
- Mongoose 8 (MongoDB)
- JWT auth (HS256)
- Zod for validation
- Swagger UI (`/docs`) generated from route files _(not completed)_
- Pino logger (pretty output in dev)

### Project goals

- Build a secure, production-ready REST API for task management with clear boundaries and RBAC
- Model a full task lifecycle with status transitions, timestamps (started/completed/cancelled), and change history
- Support assignment workflow with `assignedTo` and `assignedBy` audit information
- Provide great DX: strict TypeScript, layered architecture (controller/service/repository), structured logging, and Swagger docs
- Return lean, client-friendly DTOs via MongoDB aggregations (projections/lookups) and consistent pagination/sorting
- Offer action-oriented analytics for admins (faceted stats, trends, and breakdowns) to inform prioritization
- Be easy to extend: modular domains, shared interfaces/DTOs, and sensible Mongo indexes for common queries
- Ensure reliability: centralized error handling, graceful shutdown, and environment-based configuration

---

## Quick start

### Prerequisites

- Node.js 18+ (recommended 20+)
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/BotirjonUraimov/task-manager-backend.git
cd backend
npm install
```

### Environment variables

Create a `.env` file in `backend/` with:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mohirdev_tasks
JWT_SECRET=change-me-in-prod
JWT_EXPIRES_IN=1h

# Logging (optional)
LOG_FILE=/var/log/express.log
LOG_LEVEL=info
```

### Run in development

```bash
npm run dev
```

- Serves API at `http://localhost:3000/api`
- Swagger UI at `http://localhost:3000/docs`

### Build and start (production)

```bash
npm run build
npm start
```

### Useful scripts

- `npm run dev`: Nodemon + ts-node
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run compiled app from `dist/`
- `npm run clean`: Remove `dist/`

### Logging

The app uses Pino logger with environment-based configuration:

- **Development**: Pretty-printed logs to console with colors
- **Production**: Structured JSON logs to file (default: `/var/log/express.log`)

**Log configuration:**

- `LOG_FILE`: Custom log file path (default: `/var/log/express.log`)
- `LOG_LEVEL`: Log level (default: `debug` in dev, `info` in prod)

**Examples:**

```bash
# Custom log file
LOG_FILE=./logs/app.log npm start

# Custom log level
LOG_LEVEL=warn npm start

# Both
LOG_FILE=./logs/app.log LOG_LEVEL=error npm start
```

**Note**: Ensure the log directory exists and has write permissions, or the logger will fall back to stdout.

---

## Project structure

```
src/
  app.ts                 # Express app wiring
  index.ts               # Server bootstrap (db connect, graceful shutdown)
  config/env.ts          # Env vars loading
  lib/
    db.ts                # Mongo connection
    logger.ts            # Pino logger
    swagger.ts           # Swagger setup
  middlewares/
    auth.ts              # authenticate + authorize middlewares
    errorHandler.ts      # Global error handler
    notFound.ts          # 404 handler
  routes/
    index.ts             # Mounts /auth, /users, /tasks
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
    users/
      users.routes.ts
      users.controller.ts
      users.model.ts
    tasks/
      tasks.routes.ts
      tasks.controller.ts
      tasks.service.ts
      tasks.repository.ts
      tasks.model.ts
  common/
    interfaces/...
```

---

## Authentication & Authorization

- JWT tokens
- Roles: `admin`, `user`
- Protected routes require:
  - `authenticate` (valid JWT in `authorization:  <token>`)
  - `authorize([roles...])` (role must match)

### Obtain a token

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Admin","email":"admin@example.com","password":"secret","role":"admin"}'

# Login (get accessToken)
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"secret"}'
```

Use the returned `accessToken` as:

```
authorization: <accessToken>
```

---

## API Reference

- Base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`

### Auth

- POST `/auth/register` (public)

  - body: `{ name, email, password, role? }`
  - returns: `{ id, name, email, role }`

- POST `/auth/login` (public)

  - body: `{ email, password }`
  - returns: `{ accessToken }`

- POST `/auth/logout` (public)

  - returns: `{ message }`

- GET `/auth/me` (admin|user)
  - returns: `{ id, name, email, role }`

### Users (admin only)

- GET `/users`
- GET `/users/:id`
- POST `/users`
- PUT `/users/:id`
- DELETE `/users/:id`

### Tasks

Task shape (superset; user-facing payloads may include subsets depending on endpoint/role):

```
{
  id: string,
  title: string,
  description: string,
  dueDate: Date,
  priority: "low"|"medium"|"high",
  status: "pending"|"in_progress"|"completed"|"cancelled",
  tags: string[],
  assignedTo: string|null,
  assignedBy: string|null,
  startedAt: Date|null,
  completedAt: Date|null,
  cancelledAt: Date|null,
  createdBy: string,
  history: { from: "pending"|"in_progress"|"completed"|"cancelled", to: "pending"|"in_progress"|"completed"|"cancelled", at: Date, by: string  }[],
  createdAt: Date,
  updatedAt: Date
}
```

Common query params for list endpoints:

- `page` (default 1), `limit` (default 10, max 100)
- `sortBy` (default `createdAt`), `sortOrder` (`asc|desc`, default `desc`)

Endpoints:

- GET `/tasks` (admin|user)

  - admin: lists all tasks (includes linked user info fields when available)
  - user: lists tasks created by the current user

- GET `/tasks/assigned` (user)

  - lists tasks assigned to the current user

- GET `/tasks/:id` (admin|user)

  - admin: any task
  - user: only tasks they created OR that are assigned to them

- POST `/tasks` (admin|user)

  - body: `{ title, description, dueDate, priority, status, assignedTo?, tags? }`
  - If `assignedTo` is set, backend will set `assignedBy` to the requester id

- PUT `/tasks/:id` (admin|user)

  - admin: can update any task (assignment allowed)
  - user: can update tasks they created or that are assigned to them
  - Special behavior:
    - When `status` changes, backend sets the appropriate timestamps:
      - `in_progress` -> sets `startedAt`
      - `completed` -> sets `completedAt`
      - `cancelled` -> sets `cancelledAt`
    - A history entry `{ from, to, at, by }` is appended automatically
    - When non-admin updates `assignedTo`, it is rejected

- DELETE `/tasks/:id` (admin|user)
  - admin: any task
  - user: only tasks they created

### Tasks Analytics (admin)

- GET `/tasks/analytics` (admin)
  - query params (all optional):
    - `from` (ISO date), `to` (ISO date)
    - `assignedTo` (user id), `createdBy` (user id)
    - `status` (`pending|in_progress|completed|cancelled`)
    - `tags` (comma-separated list, e.g. `work,urgent`)
  - returns facets like:
    - `statusBreakdown`: counts per status
    - `overdue`: count of incomplete tasks past due
    - `upcoming`: tasks due in next 7 days (pending/in_progress)
    - `avgCompletionPerUser`: average completion time per assignee
    - `tagsTop`: top tags
    - `priorityOverdue`: overdue grouped by priority
    - `createdPerDay`, `completedPerDay`
    - `stuckTasks`: in_progress not updated for 7+ days

---

## cURL examples

List my created tasks (user):

```bash
curl -H "Authorization: $TOKEN" \
  'http://localhost:3000/api/tasks?page=1&limit=10&sortBy=createdAt&sortOrder=desc'
```

List tasks assigned to me (user):

```bash
curl -H "Authorization: $TOKEN" \
  'http://localhost:3000/api/tasks/assigned?page=1&limit=20'
```

Create a task:

```bash
curl -X POST -H 'Authorization: $TOKEN' -H 'Content-Type: application/json' \
  -d '{
        "title":"Write docs",
        "description":"Create README",
        "dueDate":"2025-12-31",
        "priority":"medium",
        "status":"pending",
        "tags":["docs"]
      }' \
  http://localhost:3000/api/tasks
```

Update task status (auto history):

```bash
curl -X PUT -H 'Authorization: $TOKEN' -H 'Content-Type: application/json' \
  -d '{"status":"in_progress"}' \
  http://localhost:3000/api/tasks/<taskId>
```

Analytics (admin):

```bash
curl -H 'Authorization: $ADMIN_TOKEN' \
  'http://localhost:3000/api/tasks/analytics?from=2025-01-01&to=2025-12-31&tags=docs,feature'
```

---

## Error handling

- 400 Invalid request (validation or bad input)
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (insufficient role)
- 404 Not Found (resource not accessible or missing)
- 500 Internal Server Error (unexpected)

Errors are JSON `{ error: string }`.

---

## Development notes

- Code style: strict TypeScript, explicit types for public functions
- Auth is derived from `req.user` populated by `authenticate`
- Swagger is generated from `src/**/*.routes.ts` JSDoc blocks
- Logs use Pino; adjust pretty-print via `pino-pretty` if desired

---

## Contributing

1. Create a feature branch
2. Add/adjust route docs in `*.routes.ts` so Swagger stays up to date
3. Keep interfaces in `src/common/interfaces` in sync with models and DTOs
4. Ensure new endpoints have authorization rules in routes

---

## License

ISC (see `package.json`). Update as needed.
