# Build Verification Checklist

This document provides a comprehensive checklist for verifying that the MSP Ops Dashboard project is ready for build, deployment, and launch.

## Pre-Build Verification

### Project Structure

- [x] README.md exists with complete documentation
- [x] package.json configured with all dependencies
- [x] Dockerfile configured for multi-stage builds
- [x] docker-compose.yml configured with services
- [x] .env.example file with all required variables
- [ ] **.env file created from .env.example** (required for local dev)
- [x] .gitignore properly configured
- [x] tsconfig.json for TypeScript configuration
- [x] next.config.mjs for Next.js configuration

### Source Code Structure

- [x] `/src/app` directory contains page routes
- [x] `/src/app/(dashboard)` protected routes layout
- [x] `/src/app/api` API route handlers
- [x] `/src/components` reusable React components
- [x] `/src/lib` utility functions and helpers
- [x] `/src/types` TypeScript type definitions
- [x] `/prisma` database schema and seed scripts

### Database Setup

- [x] Prisma schema.prisma defined (17 models)
- [x] Seed script (prisma/seed.ts) with default data
- [x] Environment variables for PostgreSQL connection
- [x] Database migrations support

## Build Verification Steps

### 1. Install Dependencies

```bash
npm install
```

Expected: All packages installed successfully, no critical warnings.

### 2. Type Checking

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

### 3. Linting

```bash
npm run lint
```

Expected: No critical linting errors.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

Expected:

- Prisma client generates successfully
- No errors during generation
- `@prisma/client` available in node_modules

### 5. Build Next.js

```bash
npm run build
```

Expected:

- Build completes successfully
- `.next` directory created
- No build errors in API routes, pages, or components
- All static exports work

### 6. Database Migration

```bash
npx prisma migrate dev --name init
```

Expected:

- Migrations execute without error
- Prisma client generates successfully
- Database schema matches schema.prisma

### 7. Seed Database

```bash
npx prisma db seed
```

Expected:

- Admin user created (admin@mspops.local / admin123)
- 13 technology pillars created
- 4 export templates created
- 3 sample clients created

### 8. Local Development Test

```bash
npm run dev
```

Expected:

- Development server starts on http://localhost:3000
- No build warnings in console
- Can navigate to login page
- Can login with admin credentials

### 9. Docker Build Verification

```bash
docker build -t msp-ops-dashboard:latest .
```

Expected:

- Multi-stage build completes successfully
- Image builds without errors
- All layers build correctly

### 10. Docker Compose Build Verification

```bash
docker-compose build
docker-compose up
```

Expected:

- PostgreSQL container starts and is healthy
- Web container builds and starts
- Database migrations run automatically
- Application accessible at http://localhost:3000
- Can login successfully

## Critical File Checklist

### Authentication

- [x] src/lib/auth.ts - JWT utilities
- [x] src/app/api/auth - Login/logout endpoints
- [x] Middleware for protected routes

### Ticket Management

- [x] src/app/(dashboard)/tickets - Ticket pages
- [x] src/app/api/tickets - API endpoints
- [x] src/components/tickets - Ticket components

### Knowledge Base

- [x] src/app/(dashboard)/kb - KB pages
- [x] src/app/api/kb - KB API endpoints
- [x] src/components/kb - KB components

### Tasks

- [x] src/app/(dashboard)/tasks - Task pages
- [x] src/app/api/tasks - Task API endpoints
- [x] src/components/tasks - Task components

### Code Snippets

- [x] src/app/(dashboard)/snippets - Snippet pages
- [x] src/app/api/snippets - Snippet API endpoints
- [x] src/components/snippets - Snippet components

### Reports & Export

- [x] src/app/(dashboard)/reports - Report pages
- [x] src/app/api/reports - Report API endpoints
- [x] src/lib/export.ts - Template engine

### UI Components

- [x] src/components/ui - Base UI components
- [x] src/components/layout - Layout components
- [x] src/components/shared - Shared utilities

## Environment Variables Verification

Ensure .env file has all required variables before build:

```env
# Database
DATABASE_URL=postgresql://mspops:mspops_secret@localhost:5432/msp_ops_dashboard

# App
JWT_SECRET=your-secure-random-string-here
APP_PORT=3000

# Optional
AI_PROVIDER=stub
AI_API_KEY=
UPLOAD_DIR=./uploads
```

## Performance Checks

- [ ] Bundle size within acceptable limits (<500KB main bundle)
- [ ] No console errors on page load
- [ ] Quick capture modal loads in <100ms
- [ ] Ticket list renders <500ms
- [ ] Search functionality responsive (<200ms)

## Security Checks

- [ ] JWT secret is strong (32+ characters)
- [ ] Passwords are hashed with bcrypt
- [ ] API routes validate authentication
- [ ] Database credentials not in source code
- [ ] No sensitive data in console logs
- [ ] CORS properly configured (if needed)

## Deployment Readiness

- [ ] Docker image builds successfully
- [ ] Environment variables documented in .env.example
- [ ] Database migrations are reversible
- [ ] Seed data can be reloaded without conflicts
- [ ] Dockerfile health checks configured
- [ ] Docker Compose volumes persist data
- [ ] Logs are properly configured

## Sign-Off Checklist

- [ ] All dependencies installed
- [ ] TypeScript compilation successful
- [ ] Linting passed
- [ ] Next.js build successful
- [ ] Database migrations executed
- [ ] Seed data loaded
- [ ] Local dev server runs
- [ ] Login page accessible and functional
- [ ] Docker image builds
- [ ] Docker Compose stack runs
- [ ] Application accessible at http://localhost:3000
- [ ] Can login with admin@mspops.local / admin123
- [ ] README.md is comprehensive
- [ ] All required files present and correct

## Troubleshooting Common Issues

### Issue: "Environment variable not found: DATABASE_URL"

**Symptoms**: Prisma commands fail with environment variable error.

**Solution**:

```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
# Make sure DATABASE_URL is set correctly
```

### Issue: "@prisma/client did not initialize yet"

**Symptoms**: Application crashes with Prisma client error on login.

**Solution**:

```bash
# Generate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

### Issue: esbuild platform mismatch

**Symptoms**: Seed command fails with error about wrong esbuild platform binary.

**Solution**:

```bash
# Rebuild esbuild for current platform
npm rebuild esbuild

# Or reinstall all dependencies
rm -rf node_modules
npm install
```

### Issue: Port 3000 already in use

**Symptoms**: Dev server says port is in use.

**Solution**:

- Next.js will automatically try 3001, 3002, etc.
- Or stop the process using port 3000
- Or change `APP_PORT` in `.env`

### Issue: Database connection refused

**Symptoms**: Cannot connect to PostgreSQL database.

**Solution**:

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Start PostgreSQL if not running
docker run -d --name msp-postgres \\
  -e POSTGRES_USER=mspops \\
  -e POSTGRES_PASSWORD=mspops_secret \\
  -e POSTGRES_DB=msp_ops_dashboard \\
  -p 5432:5432 \\
  postgres:16-alpine
```

## Next Steps After Verification

1. **Testing**
   - Run integration tests
   - Test all CRUD operations
   - Verify keyboard shortcuts (Ctrl+N)
   - Test export functionality

2. **Performance Optimization**
   - Analyze bundle size
   - Optimize images
   - Enable caching headers
   - Minify CSS/JS

3. **Documentation**
   - Create API documentation
   - Document deployment procedures
   - Create troubleshooting guide
   - Document keyboard shortcuts

4. **Launch**
   - Set strong JWT_SECRET
   - Configure database backups
   - Set up monitoring
   - Plan rollout strategy

## Quick Start Commands

```bash
# Local development
npm install
npm run dev

# Docker development
docker-compose up -d
docker-compose exec web npx prisma db seed

# Production build
npm install
npm run build
npm start

# Docker production
docker-compose build
docker-compose up -d
```

## Support

For issues during build verification:

1. Check that all dependencies in package.json are correct
2. Verify Node.js version (20+)
3. Ensure PostgreSQL is running
4. Check .env file configuration
5. Review console output for specific errors
6. Check Docker logs: `docker-compose logs`

---

Generated: 2026-02-06
Status: Ready for Build Verification
