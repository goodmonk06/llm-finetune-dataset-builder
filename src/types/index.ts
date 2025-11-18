import { z } from 'zod';

// ============================================================================
// Enums (matching Prisma schema)
// ============================================================================

export const DatasetTypeEnum = z.enum(['chat_log', 'faq', 'custom']);
export const DatasetStatusEnum = z.enum(['draft', 'processing', 'ready', 'archived']);
export const ExportFormatEnum = z.enum(['openai_finetune', 'jsonl', 'csv']);
export const ReviewStatusEnum = z.enum([
  'pending',
  'approved',
  'rejected',
  'needs_revision',
]);
export const RuleTypeEnum = z.enum([
  'length_check',
  'keyword_presence',
  'keyword_absence',
  'quality_threshold',
  'format_validation',
  'custom',
]);
export const RuleSeverityEnum = z.enum(['info', 'warning', 'error', 'critical']);
export const JobTypeEnum = z.enum([
  'import',
  'clean',
  'export',
  'quality_check',
  'batch_tag',
  'version_snapshot',
]);
export const JobStatusEnum = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);
export const AnnotationTypeEnum = z.enum(['comment', 'correction', 'flag', 'approval']);

// ============================================================================
// Base Schemas
// ============================================================================

export const CreateSourceDatasetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: DatasetTypeEnum,
  status: DatasetStatusEnum.optional(),
  rawStorageKey: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const UpdateSourceDatasetSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: DatasetStatusEnum.optional(),
  config: z.record(z.any()).optional(),
  statistics: z.record(z.any()).optional(),
});

export const CreateExampleSchema = z.object({
  sourceDatasetId: z.string().uuid(),
  inputText: z.string().min(1),
  outputText: z.string().min(1),
  metaJson: z.record(z.any()).optional(),
  qualityScore: z.number().min(0).max(1).optional(),
  flags: z.array(z.string()).optional(),
  reviewStatus: ReviewStatusEnum.optional(),
});

export const UpdateExampleSchema = z.object({
  inputText: z.string().min(1).optional(),
  outputText: z.string().min(1).optional(),
  metaJson: z.record(z.any()).optional(),
  qualityScore: z.number().min(0).max(1).optional(),
  flags: z.array(z.string()).optional(),
  reviewStatus: ReviewStatusEnum.optional(),
});

export const CreateExportSchema = z.object({
  name: z.string().min(1),
  sourceIds: z.array(z.string().uuid()),
  format: ExportFormatEnum,
});

// ============================================================================
// Phase 3: New Entity Schemas
// ============================================================================

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
});

export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
});

export const AssignTagSchema = z.object({
  tagId: z.string().uuid(),
  targetType: z.enum(['dataset', 'example']),
  targetId: z.string().uuid(),
});

export const CreateQualityRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ruleType: RuleTypeEnum,
  condition: z.record(z.any()), // Flexible condition object
  severity: RuleSeverityEnum.optional(),
  isActive: z.boolean().optional(),
});

export const UpdateQualityRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  condition: z.record(z.any()).optional(),
  severity: RuleSeverityEnum.optional(),
  isActive: z.boolean().optional(),
});

export const CreateDatasetVersionSchema = z.object({
  datasetId: z.string().uuid(),
  changeLog: z.string().optional(),
  createdBy: z.string().optional(),
});

export const CreateProcessingJobSchema = z.object({
  datasetId: z.string().uuid().optional(),
  jobType: JobTypeEnum,
  config: z.record(z.any()).optional(),
});

export const UpdateProcessingJobSchema = z.object({
  status: JobStatusEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
  result: z.record(z.any()).optional(),
});

export const CreateAnnotationSchema = z.object({
  exampleId: z.string().uuid(),
  comment: z.string().min(1),
  annotationType: AnnotationTypeEnum,
  createdBy: z.string().optional(),
});

export const ApplyQualityRuleSchema = z.object({
  ruleId: z.string().uuid(),
  datasetId: z.string().uuid(),
  dryRun: z.boolean().optional(), // Preview without applying
});

export const MergeDatasetSchema = z.object({
  sourceDatasetIds: z.array(z.string().uuid()).min(2),
  targetName: z.string().min(1),
  mergeStrategy: z.enum(['combine', 'deduplicate']).optional(),
});

export const BatchTagSchema = z.object({
  targetIds: z.array(z.string().uuid()).min(1),
  targetType: z.enum(['dataset', 'example']),
  tagIds: z.array(z.string().uuid()).min(1),
  action: z.enum(['add', 'remove']),
});

// ============================================================================
// Type Exports
// ============================================================================

export type DatasetType = z.infer<typeof DatasetTypeEnum>;
export type DatasetStatus = z.infer<typeof DatasetStatusEnum>;
export type ExportFormat = z.infer<typeof ExportFormatEnum>;
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;
export type RuleType = z.infer<typeof RuleTypeEnum>;
export type RuleSeverity = z.infer<typeof RuleSeverityEnum>;
export type JobType = z.infer<typeof JobTypeEnum>;
export type JobStatus = z.infer<typeof JobStatusEnum>;
export type AnnotationType = z.infer<typeof AnnotationTypeEnum>;

export type CreateSourceDataset = z.infer<typeof CreateSourceDatasetSchema>;
export type UpdateSourceDataset = z.infer<typeof UpdateSourceDatasetSchema>;
export type CreateExample = z.infer<typeof CreateExampleSchema>;
export type UpdateExample = z.infer<typeof UpdateExampleSchema>;
export type CreateExport = z.infer<typeof CreateExportSchema>;
export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
export type AssignTag = z.infer<typeof AssignTagSchema>;
export type CreateQualityRule = z.infer<typeof CreateQualityRuleSchema>;
export type UpdateQualityRule = z.infer<typeof UpdateQualityRuleSchema>;
export type CreateDatasetVersion = z.infer<typeof CreateDatasetVersionSchema>;
export type CreateProcessingJob = z.infer<typeof CreateProcessingJobSchema>;
export type UpdateProcessingJob = z.infer<typeof UpdateProcessingJobSchema>;
export type CreateAnnotation = z.infer<typeof CreateAnnotationSchema>;
export type ApplyQualityRule = z.infer<typeof ApplyQualityRuleSchema>;
export type MergeDataset = z.infer<typeof MergeDatasetSchema>;
export type BatchTag = z.infer<typeof BatchTagSchema>;

// ============================================================================
// OpenAI fine-tuning format (unchanged)
// ============================================================================

export interface OpenAIFineTuneExample {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

// ============================================================================
// Import formats (unchanged)
// ============================================================================

export interface ChatLogMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatLogConversation {
  messages: ChatLogMessage[];
  metadata?: Record<string, any>;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

// ============================================================================
// Event Types (for extensibility)
// ============================================================================

export type DomainEvent =
  | DatasetCreatedEvent
  | DatasetUpdatedEvent
  | ExampleCreatedEvent
  | ExampleCleanedEvent
  | ExportCompletedEvent
  | JobStartedEvent
  | JobCompletedEvent
  | JobFailedEvent
  | QualityRuleViolationEvent;

export interface DatasetCreatedEvent {
  type: 'dataset.created';
  payload: {
    datasetId: string;
    name: string;
    type: DatasetType;
  };
  timestamp: Date;
}

export interface DatasetUpdatedEvent {
  type: 'dataset.updated';
  payload: {
    datasetId: string;
    changes: Record<string, any>;
  };
  timestamp: Date;
}

export interface ExampleCreatedEvent {
  type: 'example.created';
  payload: {
    exampleId: string;
    datasetId: string;
  };
  timestamp: Date;
}

export interface ExampleCleanedEvent {
  type: 'example.cleaned';
  payload: {
    exampleId: string;
    oldQualityScore?: number;
    newQualityScore: number;
  };
  timestamp: Date;
}

export interface ExportCompletedEvent {
  type: 'export.completed';
  payload: {
    exportId: string;
    format: ExportFormat;
    filePath: string;
    count: number;
  };
  timestamp: Date;
}

export interface JobStartedEvent {
  type: 'job.started';
  payload: {
    jobId: string;
    jobType: JobType;
  };
  timestamp: Date;
}

export interface JobCompletedEvent {
  type: 'job.completed';
  payload: {
    jobId: string;
    jobType: JobType;
    result: any;
  };
  timestamp: Date;
}

export interface JobFailedEvent {
  type: 'job.failed';
  payload: {
    jobId: string;
    jobType: JobType;
    error: string;
  };
  timestamp: Date;
}

export interface QualityRuleViolationEvent {
  type: 'quality_rule.violation';
  payload: {
    ruleId: string;
    exampleId: string;
    severity: RuleSeverity;
    details: any;
  };
  timestamp: Date;
}

// ============================================================================
// Quality Rule Condition Types
// ============================================================================

export interface LengthCheckCondition {
  minLength?: number;
  maxLength?: number;
  field: 'input' | 'output' | 'both';
}

export interface KeywordCondition {
  keywords: string[];
  field: 'input' | 'output' | 'both';
  matchType: 'any' | 'all';
  caseSensitive?: boolean;
}

export interface QualityThresholdCondition {
  minScore: number;
  maxScore?: number;
}

export interface FormatValidationCondition {
  pattern: string; // regex
  field: 'input' | 'output' | 'both';
}

export type RuleCondition =
  | LengthCheckCondition
  | KeywordCondition
  | QualityThresholdCondition
  | FormatValidationCondition
  | Record<string, any>;
