# MSP Ops Dashboard

A personal operations dashboard for IT Infrastructure Consultants at managed service providers. Track tickets, capture resolutions, build a knowledge base, manage tasks, and generate reports — all optimized for speed (15–60 second capture time).

## Features

- **Quick Capture** — Create ticket notes in under 60 seconds with Ctrl+N keyboard shortcut
- **Ticket Tracking** — Full incident lifecycle with auto-timestamped status changes
- **Resolution Capture** — Structured root cause, fix, validation, and prevention fields
- **Knowledge Base** — Searchable KB articles linked to tickets with technology pillar tags
- **Tasks & Follow-ups** — Track to-dos with priorities, due dates, and client associations
- **Code Snippets** — Reusable PowerShell, Terraform, CLI, SQL snippets with one-click copy
- **Reporting** — Weekly/quarterly reports with breakdowns by pillar, client, and priority
- **Export Templates** — Markdown preview exports plus DOCX download for ticket notes
- **Multi-Client Support** — Track work across 30+ client environments (Azure, on-prem, hybrid)
- **13 Technology Pillars** — Azure, Entra ID, AD DS, Windows Server, VMware, Networking, Security/SOC, SQL, DevOps, Automation, Backups/DR, Certificates/TLS, Monitoring

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Custom shadcn-style components + Lucide icons
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: JWT session cookies (bcrypt password hashing)
- **Validation**: Zod schemas (shared client/server)
- **Containerization**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- (Optional) Node.js 20+ for local development

### Using Docker Compose (Recommended)

1. **Clone and configure:**

   ```bash
   git clone <your-repo-url> msp-ops-dashboard
   cd msp-ops-dashboard
   cp .env.example .env
   ```

2. **Edit .env** (at minimum, change the JWT_SECRET and update DATABASE_URL host to 'db'):

   ```env
   DATABASE_URL="postgresql://mspops:mspops_secret@db:5432/msp_ops_dashboard"
   JWT_SECRET=your-secure-random-string-here
   ```

3. **Start the app:**

   ```bash
   docker-compose up -d
   ```

4. **Run database seed:**

   ```bash
   docker-compose exec web npx prisma db seed
   ```

5. **Open the app:** [http://localhost:3000](http://localhost:3000)

6. **Login with default credentials:**
   - Email: `admin@mspops.local`
   - Password: `admin123`

### Local Development (without Docker)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start PostgreSQL** (use Docker or a local install):

   ```bash
   docker run -d --name msp-postgres \
     -e POSTGRES_USER=mspops \
     -e POSTGRES_PASSWORD=mspops_secret \
     -e POSTGRES_DB=msp_ops_dashboard \
     -p 5432:5432 \
     postgres:16-alpine
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit DATABASE_URL and JWT_SECRET as needed
   ```

4. **Generate Prisma Client:**

   ```bash
   npx prisma generate
   ```

5. **Run migrations and seed:**

   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

6. **Start the dev server:**

   ```bash
   npm run dev
   ```

7. **Open:** [http://localhost:3000](http://localhost:3000)
   - If port 3000 is in use, Next.js commonly starts at [http://localhost:3001](http://localhost:3001)

## Project Structure

```
msp-ops-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema (17 models)
│   └── seed.ts                # Seed data (pillars, templates, sample clients)
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Authenticated routes
│   │   │   ├── page.tsx       # Home dashboard
│   │   │   ├── tickets/       # Ticket list + detail
│   │   │   ├── kb/            # Knowledge base
│   │   │   ├── tasks/         # Task management
│   │   │   ├── snippets/      # Code snippets
│   │   │   ├── reports/       # Activity reports
│   │   │   └── settings/      # Admin settings
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Login, logout, session
│   │   │   ├── tickets/       # Ticket CRUD
│   │   │   ├── kb/            # KB article CRUD
│   │   │   ├── tasks/         # Task CRUD
│   │   │   ├── snippets/      # Snippet CRUD
│   │   │   ├── clients/       # Client management
│   │   │   ├── export/        # Template-based exports
│   │   │   └── reports/       # Report generation
│   │   └── login/             # Login page
│   ├── components/
│   │   ├── ui/                # Base UI components (button, card, dialog, etc.)
│   │   ├── layout/            # Sidebar, header, quick capture modal
│   │   ├── tickets/           # Ticket list + detail components
│   │   ├── kb/                # KB list + form components
│   │   ├── tasks/             # Task management components
│   │   ├── snippets/          # Snippet list + form components
│   │   ├── settings/          # Settings management
│   │   └── shared/            # Status badges, empty states
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # JWT auth utilities
│   │   ├── utils.ts           # Helpers, constants, colors
│   │   ├── validations.ts     # Zod schemas
│   │   ├── export.ts          # Template engine
│   │   ├── docx-export.ts     # Markdown-to-DOCX builder
│   │   └── redact.ts          # Sensitive data redaction
│   └── hooks/
│       └── use-keyboard-shortcut.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## Keyboard Shortcuts

| Shortcut | Action                          |
| -------- | ------------------------------- |
| `Ctrl+N` | Open Quick Capture (new ticket) |

## Data Model

The app tracks these core entities:

- **Clients** — Organizations you support, with environment tags
- **Tickets** — Incidents, service requests, problems, changes
- **Resolutions** — Root cause, fix, validation, prevention
- **KB Articles** — Searchable knowledge linked to tickets
- **Tasks** — Follow-ups, monitoring, client actions
- **Snippets** — Reusable code (PowerShell, SQL, CLI, etc.)
- **Evidence** — Screenshots, logs, attachments
- **Doc Artifacts** — Generated exports (ticket notes, PIRs, handoffs)
- **Export Templates** — Editable Markdown templates

## Default Seed Data

After running `prisma db seed`, you get:

- **Admin user**: admin@mspops.local / admin123
- **13 Technology Pillars**: Azure, Entra ID, AD DS, Windows Server, VMware/Hyper-V, Networking, Security/SOC, SQL, DevOps/Jenkins, Automation/n8n, Backups/DR, Certificates/TLS, Monitoring/LogicMonitor
- **4 Export Templates**: Ticket Note, Handoff Document, Change Plan, Post-Incident Report
- **3 Sample Clients**: Contoso Ltd (CON), Fabrikam Inc (FAB), Northwind Traders (NWT)

## Environment Variables

| Variable       | Description                                | Default                                                              |
| -------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string               | `postgresql://mspops:mspops_secret@localhost:5432/msp_ops_dashboard` |
| `JWT_SECRET`   | Secret for JWT token signing               | `change-me-in-production`                                            |
| `APP_PORT`     | Application port                           | `3000`                                                               |
| `AI_PROVIDER`  | AI helper provider (stub/openai/anthropic) | `stub`                                                               |
| `AI_API_KEY`   | API key for AI provider                    | (empty)                                                              |
| `UPLOAD_DIR`   | Directory for evidence uploads             | `./uploads`                                                          |

## Troubleshooting

### "Connection error" on login

**Cause**: Prisma client not generated or database not accessible.

**Solution**:

```bash
# Generate Prisma client
npx prisma generate

# Ensure database is running and migrations are applied
npx prisma migrate dev --name init
```

### "Environment variable not found: DATABASE_URL"

**Cause**: Missing `.env` file.

**Solution**:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### esbuild platform mismatch error

**Cause**: `node_modules` copied from different OS (e.g., Windows/Linux to macOS).

**Solution**:

```bash
npm rebuild esbuild
# Or reinstall all dependencies:
rm -rf node_modules
npm install
```

### Port 3000 already in use

**Cause**: Another application is using port 3000.

**Solution**: Next.js will automatically try port 3001. Or update `APP_PORT` in `.env`.

## Roadmap

- [ ] AI Draft Helper (structured resolution from notes, KB article drafts)
- [ ] Evidence upload with drag-and-drop
- [x] DOCX export (ticket note download implemented)
- [ ] Full-text search upgrade (Meilisearch)
- [ ] Background job queue (BullMQ/Redis)
- [ ] Multi-user support with role-based access
- [ ] Dark mode

## Current State (2026-02-06)

- Build is passing (`npm run build`)
- Linting is configured and passing (`npm run lint`)
- Dashboard routes are forced dynamic to avoid build-time Prisma failures when DB is unavailable
- Ticket export supports:
  - Markdown preview for all templates
  - DOCX download for Ticket Note

## License

Private — Personal use.
