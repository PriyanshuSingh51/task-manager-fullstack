# Task Management Full Stack Application

A complete full stack task management application with a **React 18 + TypeScript** frontend and a **Spring Boot 3** backend. Features JWT authentication with refresh tokens, real-time updates via WebSocket, drag-and-drop task management, and a responsive UI built with Tailwind CSS.

## Project Overview

This project demonstrates end-to-end full stack development: a secured REST API backed by PostgreSQL, a typed React client that consumes it, and the supporting infrastructure (Docker, CI) to run and ship it.

**Goals**
- Practice consuming a Spring Boot REST API from React using hooks and a typed service layer
- Implement a full JWT authentication flow (access + refresh tokens) end to end
- Build a Kanban-style task board with drag-and-drop status changes
- Wire up WebSocket-based real-time updates between clients
- Containerize and document the application for easy local setup

## Features

### Backend (Spring Boot)
- JWT authentication with access + refresh tokens (`jjwt`)
- REST API for task CRUD operations, filtering, and pagination
- WebSocket endpoint (STOMP over `/ws`) for real-time task updates
- PostgreSQL database with Flyway migrations (H2 for tests)
- Spring Security with role-based access control
- Centralized exception handling with consistent error responses
- OpenAPI/Swagger documentation
- Actuator health/metrics endpoints

### Frontend (React + TypeScript)
- JWT authentication flow with automatic token refresh (Axios interceptors)
- Task board with drag-and-drop between Todo / In Progress / Completed columns
- Task list, search, and filtering by status/priority
- Real-time updates via WebSocket
- Responsive design with Tailwind CSS, dark/light theme
- Form validation, loading skeletons, and error boundaries
- Custom hooks (`useTasks`, `useDebounce`) and Context API for state

## Technology Stack

**Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA, PostgreSQL, Flyway, JWT (jjwt), WebSocket/STOMP, Maven, JUnit

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router, Context API

**Infra:** Docker, Docker Compose, GitHub Actions

## Project Structure

```
week8-task-manager-fullstack/
├── backend/                     # Spring Boot REST API
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/              # Security, CORS, WebSocket, OpenAPI config
│   │   ├── controller/          # Auth, Task, User REST controllers
│   │   ├── service/              # Business logic
│   │   ├── security/             # JWT provider, filter, user details
│   │   ├── model/{entity,dto,enums}
│   │   ├── repository/           # Spring Data JPA repositories
│   │   └── exception/            # Global exception handling
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-docker.yml
│   │   └── db/migration/         # Flyway SQL migrations
│   └── Dockerfile
├── frontend/                    # React TypeScript SPA
│   ├── src/
│   │   ├── components/           # TaskBoard, TaskForm, LoginForm, Layout, ...
│   │   ├── pages/                 # Dashboard, Login, Register, TaskDetail
│   │   ├── services/              # api.ts (Axios), websocket.ts
│   │   ├── hooks/                  # useTasks, useDebounce
│   │   ├── context/                # AuthContext, ThemeContext
│   │   └── types/                  # Shared TypeScript types
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## Setup Instructions

### Option 1 — Docker Compose (recommended)

```bash
git clone <repo-url>
cd week8-task-manager-fullstack
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- PostgreSQL: localhost:5432 (`taskmanager` / `taskmanager_pass`)

### Option 2 — Manual setup

**Backend**
```bash
cd backend
# Requires a local Postgres instance, or switch profile to use H2 (see application.yml)
mvn spring-boot:run
```

**Frontend**
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL / VITE_WS_URL if needed
npm install
npm run dev
```

The frontend dev server runs on http://localhost:3000 and proxies API calls to the backend on http://localhost:8080.

## API Documentation

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns access + refresh tokens |
| POST | `/api/auth/refresh` | Exchange a refresh token for a new access token |
| POST | `/api/auth/logout` | Invalidate the refresh token |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (filter by `status`, `priority`, `assigneeId`; paginated) |
| GET | `/api/tasks/{id}` | Get a task by id |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| PUT | `/api/tasks/{id}/status` | Update only the status of a task |

### WebSocket
- Endpoint: `ws://localhost:8080/ws`
- Topics: `/topic/tasks` (task created/updated/deleted), `/topic/notifications`

Full interactive documentation is available via Swagger UI once the backend is running.

## Component Architecture (Frontend)

```
App
 └─ AuthProvider / ThemeProvider
     └─ Router
         ├─ Login / Register  (public)
         └─ ProtectedRoute
             └─ AppLayout (Navbar)
                 ├─ Dashboard
                 │   ├─ TaskBoard (drag-and-drop columns)
                 │   ├─ TaskList (search/filter)
                 │   └─ TaskForm (create/edit modal)
                 └─ TaskDetail
```

Data flow: `services/api.ts` (Axios + interceptors) ⇄ `hooks/useTasks.ts` ⇄ page/board components. Auth state lives in `AuthContext`; live task events arrive through `services/websocket.ts` and update the same state used by `useTasks`.

## Testing Strategy

- **Backend:** unit tests with JUnit/Mockito, Spring Boot test slices, H2 in-memory DB for integration tests (`src/test/resources/application-test.yml`)
- **Frontend:** component/unit tests recommended with Vitest + Testing Library; ESLint configured (`.eslintrc.cjs`)

Run backend tests:
```bash
cd backend && mvn test
```

## Security Features

- Stateless JWT auth with short-lived access tokens and refresh tokens
- Password hashing with BCrypt
- CORS configured for the frontend origin (`CorsConfig`)
- Centralized validation and error handling (`GlobalExceptionHandler`)
- Role-based authorization on endpoints

## Environment Configuration

Backend (`application.yml` / `application-docker.yml`): datasource URL/credentials, JWT secret, CORS allowed origins.

Frontend (`.env` / `.env.example`): `VITE_API_URL`, `VITE_WS_URL`.

## License

This project was built as a learning exercise (Week 8: Frontend-Backend Integration with React) and is provided as-is for educational use.
