# LLM Fine-tune Dataset Builder

A comprehensive tool for building, cleaning, and exporting LLM fine-tuning datasets from raw conversation logs, FAQs, and Q&A pairs.

## Features

- **Import from multiple formats**: JSON chat logs, CSV files, FAQs
- **AI-powered cleaning**: Use OpenAI to normalize, clean, and score data quality
- **Flexible export**: Export to OpenAI fine-tuning format, JSONL, or CSV
- **REST API**: Programmatic access to all dataset operations
- **Web UI**: Browse and preview datasets in your browser
- **CLI**: Powerful command-line interface for batch operations

## Tech Stack

- **Backend**: Fastify + TypeScript
- **Database**: Prisma + PostgreSQL
- **CLI**: Commander.js
- **AI Integration**: OpenAI API for data cleaning
- **UI**: Minimal HTML/JavaScript interface

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd llm-finetune-dataset-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL and OPENAI_API_KEY
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Or build and run production
npm run build
npm start
```

The API will be available at `http://localhost:3000` and the UI at `http://localhost:3000/ui/`

## CLI Usage

### Import Chat Logs

Import conversation logs from JSON or CSV files:

```bash
# Import chat log
npm run cli import-chat -- --file ./examples/chat_log.json --name "Customer Support Chats"

# Import FAQ
npm run cli import-chat -- --file ./examples/faq.json --type faq --name "Product FAQ"
```

**Expected JSON format for chat logs:**

```json
[
  {
    "messages": [
      { "role": "user", "content": "How do I reset my password?" },
      { "role": "assistant", "content": "You can reset your password by clicking..." }
    ],
    "metadata": { "category": "support" }
  }
]
```

**Expected JSON format for FAQs:**

```json
[
  {
    "question": "What are your business hours?",
    "answer": "We're open Monday-Friday, 9am-5pm EST.",
    "category": "general",
    "tags": ["hours", "support"]
  }
]
```

### Clean Data with AI

Use OpenAI to clean, normalize, and score data quality:

```bash
npm run cli clean -- --dataset <dataset-id> --limit 100
```

This will:
- Remove PII (emails, phone numbers, etc.)
- Fix typos and grammar
- Normalize formatting
- Assign quality scores (0-1)

### Export Datasets

Export your cleaned data to various formats:

```bash
# Export to OpenAI fine-tuning format
npm run cli export -- --dataset <dataset-id> --format openai_finetune

# Export only high-quality examples
npm run cli export -- --dataset <dataset-id> --format openai_finetune --min-quality 0.7
```

**OpenAI fine-tuning format example:**

```jsonl
{"messages": [{"role": "user", "content": "How do I reset my password?"}, {"role": "assistant", "content": "Click the 'Forgot Password' link on the login page..."}]}
{"messages": [{"role": "user", "content": "What are your business hours?"}, {"role": "assistant", "content": "We're open Monday-Friday, 9am-5pm EST."}]}
```

### List Datasets

View all your datasets:

```bash
# Simple list
npm run cli list

# Verbose mode with sample examples
npm run cli list -- --verbose
```

## API Endpoints

### Datasets

- `GET /datasets` - List all datasets
- `GET /datasets/:id` - Get dataset details
- `POST /datasets` - Create a new dataset
- `DELETE /datasets/:id` - Delete a dataset

### Examples

- `GET /datasets/:datasetId/examples` - List examples (supports pagination)
- `GET /examples/:id` - Get single example
- `POST /examples` - Create an example
- `PATCH /examples/:id` - Update an example
- `DELETE /examples/:id` - Delete an example

### Exports

- `GET /exports` - List all exports
- `GET /exports/:id` - Get export details
- `POST /exports` - Create and execute an export

## Using with OpenAI Fine-tuning

After exporting your dataset in `openai_finetune` format:

### 1. Upload the file

```bash
openai api files.create -f exports/your_export.jsonl -p fine-tune
```

### 2. Create a fine-tuning job

```bash
openai api fine_tuning.jobs.create -t file-<your-file-id> -m gpt-3.5-turbo
```

### 3. Monitor the job

```bash
openai api fine_tuning.jobs.get -i <job-id>
```

### 4. Use your fine-tuned model

```bash
openai api chat_completions.create -m ft:gpt-3.5-turbo:your-org:custom-suffix
```

## Database Schema

### SourceDataset
- `id` (UUID)
- `name` (String)
- `type` (chat_log | faq | custom)
- `rawStorageKey` (String, optional)
- `createdAt` (DateTime)

### Example
- `id` (UUID)
- `sourceDatasetId` (UUID, foreign key)
- `inputText` (Text)
- `outputText` (Text)
- `metaJson` (JSON, optional)
- `qualityScore` (Float, 0-1)
- `createdAt` (DateTime)

### DatasetExport
- `id` (UUID)
- `name` (String)
- `sourceIds` (JSON array)
- `format` (openai_finetune | jsonl | csv)
- `filePath` (String)
- `createdAt` (DateTime)

## Project Structure

```
llm-finetune-dataset-builder/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── cli/
│   │   ├── index.ts           # CLI entry point
│   │   └── commands/          # CLI commands
│   ├── lib/
│   │   └── db.ts              # Prisma client
│   ├── routes/
│   │   ├── datasets.ts        # Dataset API routes
│   │   ├── examples.ts        # Example API routes
│   │   └── exports.ts         # Export API routes
│   ├── services/
│   │   ├── import.service.ts  # Import logic
│   │   ├── export.service.ts  # Export logic
│   │   └── openai.service.ts  # OpenAI integration
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── server.ts              # Fastify server
├── public/
│   └── index.html             # Web UI
├── examples/                  # Sample data files
├── exports/                   # Generated export files
└── package.json
```

## Development

```bash
# Run tests (if added)
npm test

# Lint code
npm run lint

# Format code
npm run format

# Open Prisma Studio (database GUI)
npm run db:studio

# Create a migration
npm run db:migrate
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/llm_finetune_db"
OPENAI_API_KEY="sk-..."  # Optional, only needed for cleaning
PORT=3000
```

## Best Practices

### Data Quality

1. **Import raw data first** - Don't manually clean before importing
2. **Use AI cleaning** - Let OpenAI handle normalization and quality scoring
3. **Filter by quality** - Only export examples with quality >= 0.7
4. **Review samples** - Check a few examples in the UI before final export

### Fine-tuning Tips

1. **Minimum examples**: 50-100 for testing, 500+ for production
2. **Diverse data**: Include various question types and scenarios
3. **Consistent format**: Ensure all examples follow the same structure
4. **Quality over quantity**: Better to have 100 great examples than 1000 mediocre ones

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
psql -U postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### OpenAI API Errors

- Verify your API key is valid
- Check you have sufficient credits
- Rate limits: The cleaner waits 500ms between requests

### Import Failures

- Check file format matches expected structure
- Ensure CSV has proper headers
- Validate JSON with a linter

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review sample files in `/examples`

---

Built with TypeScript, Fastify, Prisma, and OpenAI
