import { z } from 'zod';

export const DatasetTypeEnum = z.enum(['chat_log', 'faq', 'custom']);
export const ExportFormatEnum = z.enum(['openai_finetune', 'jsonl', 'csv']);

export const CreateSourceDatasetSchema = z.object({
  name: z.string().min(1),
  type: DatasetTypeEnum,
  rawStorageKey: z.string().optional(),
});

export const CreateExampleSchema = z.object({
  sourceDatasetId: z.string().uuid(),
  inputText: z.string().min(1),
  outputText: z.string().min(1),
  metaJson: z.record(z.any()).optional(),
  qualityScore: z.number().min(0).max(1).optional(),
});

export const CreateExportSchema = z.object({
  name: z.string().min(1),
  sourceIds: z.array(z.string().uuid()),
  format: ExportFormatEnum,
});

export type DatasetType = z.infer<typeof DatasetTypeEnum>;
export type ExportFormat = z.infer<typeof ExportFormatEnum>;
export type CreateSourceDataset = z.infer<typeof CreateSourceDatasetSchema>;
export type CreateExample = z.infer<typeof CreateExampleSchema>;
export type CreateExport = z.infer<typeof CreateExportSchema>;

// OpenAI fine-tuning format
export interface OpenAIFineTuneExample {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

// Chat log format for import
export interface ChatLogMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatLogConversation {
  messages: ChatLogMessage[];
  metadata?: Record<string, any>;
}

// FAQ format for import
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}
