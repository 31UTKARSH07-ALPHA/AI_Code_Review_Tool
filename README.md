# AI Code Review Tool

A CLI and REST API tool that reviews your code using AI. Send any code snippet and get back a detailed analysis including bugs, logical errors, improvements, and quality scores — powered by Groq AI (LLaMA).

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Language** — TypeScript
- **Database** — PostgreSQL
- **ORM** — Prisma 7
- **AI** — Groq API (LLaMA 3.3 70b)
- **Cache** — Redis
- **CLI** — Commander.js
- **Logging** — Winston
- **Containerization** — Docker + Docker Compose

---

## Features

- Submit code via REST API or CLI and get an AI powered review
- Auto detects programming language (Python, TypeScript, JavaScript, Java)
- Returns structured JSON with bugs, improvements, and quality score
- Caches repeated reviews using Redis (same code = instant response)
- Saves all reviews to PostgreSQL database
- Rate limiting to prevent API abuse
- GitHub webhook support — auto reviews files on every push
- Structured logging with Winston
- Fully containerized with Docker

---

## Project Structure

```
src/
├── controllers/        → request handlers
├── routes/             → API route definitions
├── services/           → AI, caching, language detection logic
├── middleware/         → rate limiting, request logging
├── lib/                → Prisma, Redis, Winston instances
└── cli/                → CLI tool
```

---

## Getting Started (Local)

### Prerequisites

Make sure you have these installed:
- Node.js 20+
- PostgreSQL 15
- Redis 7
- npm

### 1. Clone the repository

```bash
git clone https://github.com/31UTKARSH07-ALPHA/AI_Code_Review_Tool.git
cd AI_Code_Review_Tool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```
GROQ_API_KEY=your-groq-api-key
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://your_username@localhost:5432/ai_code_review
REDIS_URL=redis://localhost:6379
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

Get your free Groq API key at https://console.groq.com

### 4. Set up the database

```bash
psql postgres -c "CREATE DATABASE ai_code_review;"
npx prisma migrate deploy
```

### 5. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:8000`

---

## Getting Started (Docker)

The easiest way to run the full stack (app + PostgreSQL + Redis) with one command:

```bash
docker-compose up --build
```

This starts:
- **app** → your Express server on port 8000
- **db** → PostgreSQL on port 5433
- **redis** → Redis on port 6380

To stop:
```bash
docker-compose down
```

---

## API Endpoints

### POST /api/review
Submit code for AI review.

**Request:**
```json
{
  "code": "function divide(a, b) { return a / b }",
  "language": "javascript"
}
```

> `language` is optional — the tool auto detects it if not provided.

**Response:**
```json
{
  "id": "uuid-here",
  "cached": false,
  "language": "javascript",
  "review": {
    "summary": "Simple division function missing error handling",
    "bugs": [
      {
        "line": "return a / b",
        "issue": "Division by zero when b is 0",
        "fix": "Add a check: if (b === 0) throw new Error('Division by zero')"
      }
    ],
    "improvements": [
      {
        "suggestion": "Add TypeScript types",
        "reason": "Prevents passing non-numbers accidentally"
      }
    ],
    "quality": {
      "scores": 5,
      "comment": "Works for happy path but unsafe for production"
    }
  }
}
```

---

### GET /api/reviews
Fetch all past reviews with pagination.

**Query params:**
- `page` (default: 1)
- `limit` (default: 10)

**Example:**
```
GET /api/reviews?page=1&limit=5
```

**Response:**
```json
{
  "total": 25,
  "page": 1,
  "limit": 5,
  "totalPages": 5,
  "reviews": [...]
}
```

---

### GET /api/reviews/:id
Fetch a single review by ID.

**Example:**
```
GET /api/reviews/uuid-here
```

---

## CLI Usage

Review a file directly from your terminal:

```bash
# make sure your server is running first
npm run dev

# in a new terminal, review any file
npm run cli -- review src/controllers/reviewController.ts
```

Output:
```
========== CODE REVIEW ==========
Language : typescript
Summary  : Express controller handling code review requests

--- Bugs ---
1. [line 23] JSON.parse without try/catch
   Fix: Wrap in try/catch to handle invalid JSON

--- Improvements ---
1. Add request ID to logs
   Why: Easier to trace requests in production

--- Quality ---
Score   : 7/10
Comment : Well structured but missing some error handling
==================================
```

---

## Rate Limiting

```
All routes    → 100 requests per 15 minutes per IP
POST /review  → 10 requests per 15 minutes per IP
```

---

## GitHub Webhook

Automatically review code on every push:

1. Start your server and expose it with ngrok:
```bash
ngrok http 8000
```

2. Add webhook in your GitHub repo:
```
Settings → Webhooks → Add webhook
Payload URL  → https://your-ngrok-url.ngrok-free.dev/api/webhook
Content type → application/json
Secret       → your GITHUB_WEBHOOK_SECRET
Events       → Just the push event
```

3. Push code — your server will automatically detect and log changed files.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key | ✅ |
| `PORT` | Server port (default 8000) | ❌ |
| `NODE_ENV` | development or production | ❌ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `GITHUB_WEBHOOK_SECRET` | Secret for verifying GitHub webhooks | ❌ |

---

## CI/CD

This project uses GitHub Actions for continuous integration.

On every push to `main` or `master`:
- Installs dependencies
- Generates Prisma client
- Runs TypeScript type checking
- Builds the project

---

## License

MIT