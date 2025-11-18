# Phase 3 Overview: LLM Fine-tune Dataset Builder

## Purpose Statement

The LLM Fine-tune Dataset Builder serves as a **production-grade data preparation pipeline** for teams building custom LLM applications. It transforms messy, real-world conversation data (support tickets, chat logs, FAQs, knowledge bases) into clean, validated, high-quality training datasets optimized for fine-tuning GPT-3.5, GPT-4, and other language models.

This repository addresses the critical gap between "we have raw data" and "we have a fine-tuned model." It provides not just import/export utilities, but a complete data quality management system with versioning, collaborative tagging, quality scoring, batch processing, and integration hooks. The goal is to be the **definitive open-source tool** for LLM dataset preparation that can be deployed standalone or integrated into larger ML/AI platforms.

## Current Features (Post Phase 2)

**Core Data Pipeline:**
- ✅ Import from JSON chat logs and CSV files
- ✅ Parse conversation threads into Q&A pairs
- ✅ FAQ format support with metadata
- ✅ OpenAI-powered cleaning and quality scoring
- ✅ Export to OpenAI fine-tuning format (JSONL)
- ✅ Export to generic JSONL and CSV formats

**API & Interfaces:**
- ✅ REST API for datasets, examples, and exports
- ✅ CLI for batch operations (import, clean, export, list)
- ✅ Web UI for browsing datasets and previewing examples
- ✅ Centralized error handling with consistent responses
- ✅ Zod-based request validation

**Developer Experience:**
- ✅ Docker Compose setup (app + PostgreSQL)
- ✅ Comprehensive seeding (2 datasets, 18 examples)
- ✅ Vitest test suite with meaningful coverage
- ✅ Standard npm scripts (dev, build, test, db:*)
- ✅ TypeScript strict mode with end-to-end typing

**Data Model:**
- ✅ SourceDataset (chat_log, faq, custom types)
- ✅ Example (input/output pairs with quality scores)
- ✅ DatasetExport (export records and metadata)

## Current Limitations

**Domain Gaps:**
- ❌ No tagging or categorization beyond basic metadata
- ❌ No version control for datasets (can't track changes over time)
- ❌ No collaborative quality review workflow
- ❌ No custom quality rules or filtering logic
- ❌ No batch job tracking for long-running operations
- ❌ No dataset templates or best-practice presets
- ❌ Limited to OpenAI for cleaning (no pluggable providers)

**Integration Gaps:**
- ❌ No webhook/event system for external integrations
- ❌ No SSO or team collaboration features
- ❌ No metrics or observability beyond basic logs
- ❌ No multi-tenant support
- ❌ No API rate limiting or usage tracking

**DX & Quality Gaps:**
- ❌ Limited test coverage on services
- ❌ No integration tests for complete workflows
- ❌ No performance benchmarks or optimization
- ❌ Documentation lacks integration recipes
- ❌ No example integrations with other tools

## Phase 3 Plan

### 1. Domain Expansion (Rich Entity Model)

**New Entities:**
- **Tag**: Flexible categorization for examples and datasets (multi-tag support)
- **DatasetVersion**: Snapshot-based versioning with diffs and rollback
- **QualityRule**: User-defined rules for automated filtering/validation
- **ProcessingJob**: Track long-running batch operations with progress/status
- **DatasetTemplate**: Pre-configured settings for common use cases
- **Annotation**: Collaborative review with comments and approvals

**Enhanced Existing Entities:**
- Add `status` enum to SourceDataset (draft, processing, ready, archived)
- Add `config` JSON to SourceDataset for import/export settings
- Add `annotations` and `flags` to Example for review workflows
- Add `statistics` JSON to DatasetExport for quality metrics

### 2. Multiple Vertical Slices

**Slice 1: Tagging & Organization**
- Create/list/assign tags
- Filter datasets and examples by tags
- Tag-based export selections
- Seed data with realistic tag hierarchies

**Slice 2: Quality Rules & Filtering**
- Define custom quality rules (min length, keyword presence, score thresholds)
- Apply rules to datasets with batch processing
- View rule violations and auto-fix suggestions
- Export only examples passing specific rules

**Slice 3: Dataset Versioning**
- Create versions (snapshots) of datasets
- View version history and diffs
- Rollback to previous versions
- Branch/merge workflows for collaborative editing

**Slice 4: Batch Job System**
- Track import/clean/export operations as jobs
- Monitor job progress and status
- Retry failed jobs
- Job history and analytics

### 3. Extensibility & Integration Points

**Provider Interfaces:**
- `ICleaningProvider`: Abstract OpenAI, add support for Anthropic, local models
- `IStorageProvider`: Abstract local files, add S3/GCS support
- `IMetricsProvider`: Abstract metrics collection (Prometheus, DataDog, etc.)
- `INotificationProvider`: Webhooks, email, Slack for job completion

**Event System:**
- Domain events: DatasetCreated, ExampleCleaned, ExportCompleted
- Event bus for decoupled integrations
- Webhook delivery for external systems

**Plugin System:**
- Simple registry for custom transformations
- Pre/post processing hooks
- Custom quality scorers

### 4. DX Enhancements

**Expanded CLI:**
- `builder stats` - Show dataset statistics and insights
- `builder validate <dataset-id>` - Run quality checks
- `builder merge <dataset-ids>` - Combine multiple datasets
- `builder analyze <file>` - Preview before import

**Additional Scripts:**
- `db:reset` - Full database reset
- `db:backup` - Create backup
- `dev:debug` - Start with debugging enabled
- `typecheck` - Run tsc --noEmit

### 5. Quality & Observability

**Logging:**
- Structured logging with pino
- Request ID tracking
- Log levels and filtering
- Correlation across services

**Metrics:**
- Dataset size and growth metrics
- Quality score distributions
- Processing time tracking
- API endpoint latency

**Monitoring:**
- Health check expansion (DB, external services)
- Readiness/liveness probes
- Performance dashboards (Grafana-compatible)

### 6. Testing & Validation

**Test Expansion:**
- Integration tests for complete workflows
- Test data factories for complex entities
- API contract tests
- Performance benchmarks

**Validation Enhancement:**
- Stricter Zod schemas with better error messages
- Input sanitization
- Rate limiting on API endpoints
- Request size limits

### 7. Documentation & Examples

**New Documentation:**
- `docs/ARCHITECTURE.md` - System design and component interaction
- `docs/DOMAIN_NOTES.md` - Detailed domain model and business logic
- `docs/INTEGRATION_RECIPES.md` - Common integration patterns
- `docs/API_REFERENCE.md` - Complete API documentation
- `docs/DEPLOYMENT.md` - Production deployment guide

**Examples:**
- Integration with LangChain for model training
- Webhook integration examples
- Custom provider implementations
- Multi-dataset merge strategies

### 8. Production Readiness

**Security:**
- API key authentication (optional)
- Input validation hardening
- SQL injection prevention audit
- CORS configuration

**Performance:**
- Database query optimization
- Pagination on all list endpoints
- Caching layer for read-heavy operations
- Background job processing with Bull/BullMQ

**Scalability:**
- Horizontal scaling considerations
- Database connection pooling
- Stateless API design
- Redis for session/cache (optional)

## Success Criteria

Phase 3 is complete when:

1. ✅ At least 4 new entities are implemented with full CRUD
2. ✅ 3+ vertical slices are fully functional end-to-end
3. ✅ Provider abstraction allows swapping OpenAI for alternatives
4. ✅ Event system allows external integrations
5. ✅ Test coverage >70% on core business logic
6. ✅ Seed data demonstrates all major features
7. ✅ Documentation includes architecture diagrams and integration recipes
8. ✅ CLI has 5+ useful maintenance commands
9. ✅ Code size grows 5-10x with high quality additions
10. ✅ Repository feels like a professional product, not a prototype

## Timeline Estimate

- Domain expansion: 2-3 hours
- Vertical slices: 3-4 hours
- Extensibility layer: 2 hours
- Testing & validation: 2 hours
- Documentation: 1-2 hours
- **Total: 10-13 hours of focused implementation**

This phase transforms the repository from "working demo" to "production-grade data platform."
