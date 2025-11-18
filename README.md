# LLM Fine-tune Dataset Builder

Transform raw conversation logs, FAQs, and Q&A pairs into production-ready fine-tuning datasets for LLMs like GPT-3.5 and GPT-4.

## Overview

This tool provides an end-to-end pipeline for building high-quality fine-tuning datasets:

1. **Import** data from multiple formats (JSON chat logs, CSV files, FAQs)
2. **Clean** and normalize with AI-powered quality scoring
3. **Export** to OpenAI fine-tuning format, JSONL, or CSV
4. **Browse** datasets via web UI or REST API

Built for teams who need repeatable, scalable dataset preparation workflows.

## Tech Stack

**Backend**
- Fastify (REST API server)
- TypeScript (type-safe development)
- Prisma (type-safe ORM)
- PostgreSQL (relational database)
- Zod (runtime validation)

**Services**
- OpenAI API (optional, for data cleaning)
- Commander.js (CLI framework)

**Testing & DX**
- Vitest (unit testing)
- Docker & Docker Compose (containerization)
- ESLint & Prettier (code quality)

## Domain Model

```
SourceDataset (1) ---< (N) Example
       |
       |
       v
DatasetExport (references SourceDataset IDs)
```

**SourceDataset**: Represents an imported dataset
- `id`, `name`, `type` (chat_log | faq | custom)
- `createdAt`, `updatedAt`

**Example**: Individual training examples
- `id`, `inputText`, `outputText`
- `qualityScore` (0-1, from AI cleaning)
- `metaJson` (flexible metadata)
- References `SourceDataset`

**DatasetExport**: Export records
- `id`, `name`, `format` (openai_finetune | jsonl | csv)
- `sourceIds` (array of dataset IDs)
- `filePath`

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- OpenAI API key (optional, for cleaning features)

### Setup Steps

#### 1. Clone and Install

```bash
git clone <repository-url>
cd llm-finetune-dataset-builder
npm install
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/llm_finetune_db"
OPENAI_API_KEY="sk-..."  # Optional
PORT=3000
```

#### 3. Start Database

**Option A: Docker (Recommended)**

```bash
docker compose up -d postgres
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb llm_finetune_db
```

#### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema
npm run db:push

# Seed with sample data
npm run db:seed
```

#### 5. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

Web UI at `http://localhost:3000/ui/`

### Production Deployment

```bash
# Start all services with Docker Compose
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

## Example Flow: End-to-End Vertical Slice

This section demonstrates a complete workflow from import to export.

### 1. Import Chat Logs

```bash
npm run cli import-chat -- --file ./examples/chat_log.json --name "Support Chats"
```

Output:
```
✅ Import successful!
Dataset ID: abc123...
Examples imported: 8
```

### 2. View via API

```bash
curl http://localhost:3000/datasets
```

Response:
```json
{
  "datasets": [
    {
      "id": "abc123...",
      "name": "Support Chats",
      "type": "chat_log",
      "_count": { "examples": 8 },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. List Examples

```bash
curl http://localhost:3000/datasets/abc123.../examples?limit=2
```

Response:
```json
{
  "examples": [
    {
      "id": "ex1...",
      "inputText": "How do I reset my password?",
      "outputText": "Click 'Forgot Password' on the login page...",
      "qualityScore": null
    }
  ],
  "total": 8,
  "limit": 2,
  "offset": 0
}
```

### 4. Clean Data with AI (Optional)

```bash
npm run cli clean -- --dataset abc123... --limit 10
```

This normalizes text, removes PII, and assigns quality scores:

```
Processing 1/8... ✅ (0.95)
Processing 2/8... ✅ (0.92)
...
📊 Cleaning complete!
High quality (>=0.5): 8
```

### 5. Export to OpenAI Format

```bash
npm run cli export -- --dataset abc123... --format openai_finetune
```

Output file `exports/export_abc123_1234567890.jsonl`:

```jsonl
{"messages": [{"role": "user", "content": "How do I reset my password?"}, {"role": "assistant", "content": "Click 'Forgot Password' on the login page..."}]}
{"messages": [{"role": "user", "content": "What are your business hours?"}, {"role": "assistant", "content": "Monday-Friday, 9am-5pm EST."}]}
```

### 6. Browse in Web UI

Visit `http://localhost:3000/ui/` to:
- View all datasets
- Preview examples
- See quality scores
- Check export history

### 7. Use with OpenAI

```bash
# Upload to OpenAI
openai api files.create -f exports/export_abc123_1234567890.jsonl -p fine-tune

# Create fine-tuning job
openai api fine_tuning.jobs.create -t file-xyz123 -m gpt-3.5-turbo
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm start            # Run production server

# CLI
npm run cli <command>  # Run CLI commands

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio GUI

# Testing & Quality
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run lint         # Lint code
npm run format       # Format code
```

## CLI Commands

### import-chat

Import conversation logs or FAQs.

```bash
npm run cli import-chat -- \
  --file ./data/chats.json \
  --name "Customer Support" \
  --type chat_log
```

Options:
- `-f, --file <path>` - Input file (JSON or CSV) **required**
- `-n, --name <name>` - Dataset name (defaults to filename)
- `-t, --type <type>` - Type: `chat_log` or `faq` (default: `chat_log`)

### clean

AI-powered data cleaning and quality scoring.

```bash
npm run cli clean -- \
  --dataset <dataset-id> \
  --limit 100 \
  --quality-threshold 0.7
```

Options:
- `-d, --dataset <id>` - Dataset ID **required**
- `-l, --limit <number>` - Max examples to process (default: 100)
- `--quality-threshold <number>` - Min quality to keep (default: 0.5)

### export

Export datasets to various formats.

```bash
npm run cli export -- \
  --dataset <dataset-id> \
  --format openai_finetune \
  --min-quality 0.8
```

Options:
- `-d, --dataset <id>` - Dataset ID **required**
- `-f, --format <format>` - Format: `openai_finetune`, `jsonl`, `csv` (default: `openai_finetune`)
- `-o, --output <name>` - Custom output filename
- `--min-quality <number>` - Exclude examples below threshold

### list

List all datasets and statistics.

```bash
npm run cli list           # Simple list
npm run cli list -- -v     # Verbose with samples
```

## REST API

### Datasets

```
GET    /datasets           List all datasets
GET    /datasets/:id       Get dataset details
POST   /datasets           Create dataset
DELETE /datasets/:id       Delete dataset
```

### Examples

```
GET    /datasets/:id/examples  List examples (paginated)
GET    /examples/:id           Get single example
POST   /examples               Create example
PATCH  /examples/:id           Update example
DELETE /examples/:id           Delete example
```

### Exports

```
GET    /exports            List all exports
GET    /exports/:id        Get export details
POST   /exports            Create and execute export
```

### Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Dataset not found",
    "code": "NOT_FOUND",
    "details": {}
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Testing

Run the test suite:

```bash
npm test              # Watch mode
npm run test:run      # Single run
```

Tests cover:
- Schema validation (Zod types)
- Import service parsing logic
- Export service formatting
- Error handling

## Demo Credentials

After running `npm run db:seed`, you'll have:

- **2 datasets** (Customer Support Chats, Product FAQ)
- **18 examples** with quality scores
- **1 sample export** record

Visit `http://localhost:3000/ui/` to browse the seeded data.

## Future Extensions

**Short-term improvements:**
- [ ] Batch import via API endpoint
- [ ] Quality filtering in web UI
- [ ] Example editing interface
- [ ] Export format preview

**Medium-term features:**
- [ ] Support for JSONL import
- [ ] Custom data transformations
- [ ] Multi-dataset merging
- [ ] Deduplication logic

**Long-term vision:**
- [ ] Version control for datasets
- [ ] A/B testing of cleaned vs raw data
- [ ] Integration with model training platforms
- [ ] Automated quality benchmarking

## Troubleshooting

### Database Connection

```bash
# Check if PostgreSQL is running
pg_isready

# Verify connection string
echo $DATABASE_URL
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Change PORT in .env
PORT=3001
```

### Prisma Client Errors

```bash
# Regenerate client
npm run db:generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Docker Issues

```bash
# Rebuild images
docker compose build --no-cache

# View logs
docker compose logs -f

# Reset everything
docker compose down -v
```

## Architecture Notes

This project follows a **layered architecture**:

1. **Routes** (`src/routes/`) - HTTP endpoints, request validation
2. **Services** (`src/services/`) - Business logic, reusable operations
3. **Lib** (`src/lib/`) - Database client, shared utilities
4. **Types** (`src/types/`) - Zod schemas, TypeScript types

**Design principles:**
- Routes validate input and delegate to services
- Services contain domain logic, independent of HTTP
- Centralized error handling for consistent API responses
- Strict typing with Zod + TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add my feature"`
6. Push and create PR

## License

MIT

---

**Built with TypeScript, Fastify, Prisma, and OpenAI**

For detailed setup instructions, see [SETUP.md](SETUP.md)
