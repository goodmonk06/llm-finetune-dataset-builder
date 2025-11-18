# Setup Guide

Complete setup instructions for the LLM Fine-tune Dataset Builder.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- OpenAI API key (optional, for cleaning features)

## Step-by-Step Setup

### 1. Install PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE llm_finetune_db;

# Create user (optional)
CREATE USER llm_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE llm_finetune_db TO llm_user;

# Exit
\q
```

### 3. Clone and Install

```bash
git clone <repository-url>
cd llm-finetune-dataset-builder
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/llm_finetune_db"

# Optional - only needed for AI cleaning
OPENAI_API_KEY="sk-your-api-key-here"

# Server port
PORT=3000
```

### 5. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR create a migration (for production)
npm run db:migrate
```

### 6. Build the Project

```bash
npm run build
```

### 7. Test the Installation

```bash
# Start the server
npm run dev

# In another terminal, test the CLI
npm run cli list

# Import sample data
npm run cli import-chat -- --file ./examples/chat_log.json --name "Test Dataset"

# View in browser
open http://localhost:3000/ui/
```

## Production Deployment

### Using Docker (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: llm_finetune_db
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:your_secure_password@postgres:5432/llm_finetune_db
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      PORT: 3000
    depends_on:
      - postgres
    volumes:
      - ./exports:/app/exports

volumes:
  postgres_data:
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

Deploy:

```bash
docker-compose up -d
```

### Using PM2 (Node Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start npm --name "dataset-builder" -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Using Systemd (Linux)

Create `/etc/systemd/system/dataset-builder.service`:

```ini
[Unit]
Description=LLM Dataset Builder
After=network.target postgresql.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/llm-finetune-dataset-builder
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable dataset-builder
sudo systemctl start dataset-builder
sudo systemctl status dataset-builder
```

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
DATABASE_URL="postgresql://localhost:5432/llm_finetune_db"
OPENAI_API_KEY="sk-..."
PORT=3000
```

### Staging

```env
NODE_ENV=staging
DATABASE_URL="postgresql://staging-db:5432/llm_finetune_db"
OPENAI_API_KEY="sk-..."
PORT=3000
```

### Production

```env
NODE_ENV=production
DATABASE_URL="postgresql://prod-db:5432/llm_finetune_db"
OPENAI_API_KEY="sk-..."
PORT=3000
```

## Backup and Restore

### Backup Database

```bash
pg_dump -U postgres llm_finetune_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres llm_finetune_db < backup_20240115.sql
```

### Backup Export Files

```bash
tar -czf exports_backup_$(date +%Y%m%d).tar.gz exports/
```

## Troubleshooting

### PostgreSQL Connection Issues

1. Check if PostgreSQL is running:
   ```bash
   # macOS/Linux
   pg_isready

   # Or check service status
   sudo systemctl status postgresql
   ```

2. Verify connection string in `.env`

3. Check PostgreSQL logs:
   ```bash
   # Ubuntu
   sudo tail -f /var/log/postgresql/postgresql-14-main.log

   # macOS (Homebrew)
   tail -f /usr/local/var/log/postgres.log
   ```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf dist/
npm run build
```

## Performance Optimization

### Database Indexes

The schema includes indexes on frequently queried fields. For large datasets, consider:

```sql
-- Add additional indexes if needed
CREATE INDEX idx_example_quality ON "Example"(qualityScore DESC);
CREATE INDEX idx_example_created ON "Example"(createdAt DESC);
```

### Connection Pooling

For production, configure Prisma connection pooling in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 60
  connection_limit = 10
}
```

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Restrict database access to application server
- [ ] Regularly update dependencies: `npm audit fix`
- [ ] Set up database backups
- [ ] Monitor API usage and costs
- [ ] Implement rate limiting for API endpoints

## Next Steps

1. Import your first dataset
2. Test the cleaning pipeline
3. Export and validate the output
4. Set up automated backups
5. Configure monitoring and logging

For support, see the main [README.md](README.md)
