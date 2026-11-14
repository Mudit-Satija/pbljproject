# ClipSync

A temporary, room-based clipboard. Create a room, paste text, and open the same
eight-character code on another device. No accounts, no installs, no fuss.

Rooms — and everything in them — are deleted 24 hours after creation.

## Stack

| Layer    | Tools                                                              |
| -------- | ------------------------------------------------------------------ |
| Backend  | Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Validation    |
| Database | PostgreSQL 16, Hibernate                                           |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, Lucide, Axios, Sonner, React Router |
| Tooling  | Maven, Docker Compose                                              |

## Project layout

```
.
├── backend/                 Spring Boot REST API
│   ├── src/main/java/com/clipsync/
│   │   ├── room/            Room entity, repository, service, controller
│   │   ├── common/          API error handling
│   │   └── config/          CORS configuration
│   └── src/test/            API integration tests + room code tests
├── frontend/                React single-page app
│   └── src/
│       ├── pages/           Home, room, 404
│       ├── components/      Header, room code, save status
│       ├── hooks/           Room loading, autosave, polling
│       └── lib/             API client, clipboard and time helpers
├── docker-compose.yml       PostgreSQL for local development
└── .env.example             Configuration reference
```

## Running it locally

Requirements: JDK 21, Maven 3.9+, Node 20+, and Docker (or any PostgreSQL 16
instance).

If you have several JDKs installed, make Maven use Java 21 first, for example on
macOS with Homebrew:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
```

**1. Start PostgreSQL**

```bash
cd "OnlineClip board"
docker compose up -d
```

The defaults match the compose file; copy `.env.example` to `.env` only if you
want to change the database name, user, password, or port.

The compose file publishes PostgreSQL on host port **5433** so it won't clash
with a locally installed Postgres on 5432.

**2. Start the API**

```bash
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. Configuration comes from
environment variables, with sensible defaults in
[`application.yml`](backend/src/main/resources/application.yml).

**3. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend, so
there is nothing else to configure for development.

> Using a PostgreSQL instance on another port? Override the connection:
> `DB_URL=jdbc:postgresql://localhost:5432/clipsync DB_USERNAME=... DB_PASSWORD=... mvn spring-boot:run`

## API

Base URL: `/api`

| Method | Path              | Description                                  | Success |
| ------ | ----------------- | -------------------------------------------- | ------- |
| POST   | `/rooms`          | Create a room with a new eight-character code | 201     |
| GET    | `/rooms/{code}`   | Fetch a room and its current text            | 200     |
| PUT    | `/rooms/{code}`   | Replace the room's text                      | 200     |

Room response:

```json
{
  "code": "K7M2P9RX",
  "content": "shared text",
  "createdAt": "2026-11-14T09:30:00Z",
  "updatedAt": "2026-11-14T09:31:12Z",
  "expiresAt": "2026-11-15T09:30:00Z",
  "revision": 3
}
```

Update request:

```json
{ "content": "new clipboard text" }
```

Errors use a consistent shape:

```json
{
  "timestamp": "2026-11-14T09:31:12Z",
  "status": 404,
  "error": "Not Found",
  "message": "That room was not found or has expired."
}
```

Unknown or expired codes return `404`. Content longer than 200,000 characters
returns `400`. Codes are case-insensitive and are easy to read aloud: the
alphabet excludes `0/O` and `1/I`.

## How syncing works

- Typing updates the editor immediately and saves after a **700 ms** pause.
- While a room is open, the client polls it every **2.5 seconds**. If the server
  has a newer revision and the local editor has no unsaved edits, the new text is
  applied. This gives each device the same clipboard without requiring WebSockets.
- Every save increments the room's `revision`. The client ignores poll responses
  older than the last revision it has seen, so a slow request can never overwrite
  a newer save.
- Saves are last-write-wins. If two devices edit at the exact same moment, the
  later save is kept.
- Failed saves are retried every **4 seconds**; the toolbar shows the current
  state.
- On load, expired rooms return `404`, and a scheduled job purges expired rows
  every 10 minutes.

## Configuration

| Variable               | Default                                         | Purpose                             |
| ---------------------- | ----------------------------------------------- | ----------------------------------- |
| `DB_URL`               | `jdbc:postgresql://localhost:5433/clipsync`     | JDBC connection URL                 |
| `DB_USERNAME`          | `clipsync`                                      | Database user                       |
| `DB_PASSWORD`          | `clipsync`                                      | Database password                   |
| `SERVER_PORT`          | `8080`                                          | API port                            |
| `ROOM_TTL`             | `PT24H`                                         | Room lifetime (ISO-8601 duration)   |
| `CLEANUP_INTERVAL`     | `PT10M`                                         | How often expired rooms are purged  |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173`                         | Comma-separated allowed frontend origins |
| `VITE_API_URL`         | `/api`                                          | API base used by the frontend build |

## Tests

```bash
cd backend
mvn test
```

Tests run against an in-memory H2 database in PostgreSQL compatibility mode, so
they do not need Docker. They cover room creation, reading, updating,
validation failures, casing, expiry, and cleanup.

Frontend type-check and production build:

```bash
cd frontend
npm run build
```

## Production notes

- Hibernate manages the schema with `ddl-auto: update` for this MVP. For a
  long-lived deployment, move the schema to Flyway or Liquibase migrations.
- Room contents are stored as plain text and protected only by the room code.
  Treat this as a convenience tool, not a place for passwords, tokens, or other
  secrets.
- To deploy the UI on its own host, build it with `npm run build`, serve
  `frontend/dist`, and point `VITE_API_URL` at the public API URL. Add that
  origin to `CORS_ALLOWED_ORIGINS`.
