import { describe, it, expect } from 'vitest';
import {
  CreateSourceDatasetSchema,
  CreateExampleSchema,
  CreateExportSchema,
  DatasetTypeEnum,
  ExportFormatEnum,
} from '../types';

describe('Type Schemas', () => {
  describe('DatasetTypeEnum', () => {
    it('should validate correct dataset types', () => {
      expect(DatasetTypeEnum.parse('chat_log')).toBe('chat_log');
      expect(DatasetTypeEnum.parse('faq')).toBe('faq');
      expect(DatasetTypeEnum.parse('custom')).toBe('custom');
    });

    it('should reject invalid dataset type', () => {
      expect(() => DatasetTypeEnum.parse('invalid')).toThrow();
    });
  });

  describe('ExportFormatEnum', () => {
    it('should validate correct export formats', () => {
      expect(ExportFormatEnum.parse('openai_finetune')).toBe('openai_finetune');
      expect(ExportFormatEnum.parse('jsonl')).toBe('jsonl');
      expect(ExportFormatEnum.parse('csv')).toBe('csv');
    });

    it('should reject invalid export format', () => {
      expect(() => ExportFormatEnum.parse('pdf')).toThrow();
    });
  });

  describe('CreateSourceDatasetSchema', () => {
    it('should validate valid dataset data', () => {
      const data = {
        name: 'Test Dataset',
        type: 'chat_log',
      };
      const result = CreateSourceDatasetSchema.parse(data);
      expect(result.name).toBe('Test Dataset');
      expect(result.type).toBe('chat_log');
    });

    it('should validate with optional rawStorageKey', () => {
      const data = {
        name: 'Test Dataset',
        type: 'faq',
        rawStorageKey: 's3://bucket/key',
      };
      const result = CreateSourceDatasetSchema.parse(data);
      expect(result.rawStorageKey).toBe('s3://bucket/key');
    });

    it('should reject empty name', () => {
      const data = {
        name: '',
        type: 'chat_log',
      };
      expect(() => CreateSourceDatasetSchema.parse(data)).toThrow();
    });

    it('should reject missing required fields', () => {
      expect(() => CreateSourceDatasetSchema.parse({})).toThrow();
    });
  });

  describe('CreateExampleSchema', () => {
    it('should validate valid example data', () => {
      const data = {
        sourceDatasetId: '123e4567-e89b-12d3-a456-426614174000',
        inputText: 'Question',
        outputText: 'Answer',
      };
      const result = CreateExampleSchema.parse(data);
      expect(result.inputText).toBe('Question');
      expect(result.outputText).toBe('Answer');
    });

    it('should validate with optional fields', () => {
      const data = {
        sourceDatasetId: '123e4567-e89b-12d3-a456-426614174000',
        inputText: 'Question',
        outputText: 'Answer',
        metaJson: { category: 'test' },
        qualityScore: 0.95,
      };
      const result = CreateExampleSchema.parse(data);
      expect(result.qualityScore).toBe(0.95);
      expect(result.metaJson).toEqual({ category: 'test' });
    });

    it('should reject quality score outside range', () => {
      const data = {
        sourceDatasetId: '123e4567-e89b-12d3-a456-426614174000',
        inputText: 'Question',
        outputText: 'Answer',
        qualityScore: 1.5,
      };
      expect(() => CreateExampleSchema.parse(data)).toThrow();
    });

    it('should reject invalid UUID', () => {
      const data = {
        sourceDatasetId: 'not-a-uuid',
        inputText: 'Question',
        outputText: 'Answer',
      };
      expect(() => CreateExampleSchema.parse(data)).toThrow();
    });
  });

  describe('CreateExportSchema', () => {
    it('should validate valid export data', () => {
      const data = {
        name: 'Export 1',
        sourceIds: ['123e4567-e89b-12d3-a456-426614174000'],
        format: 'openai_finetune',
      };
      const result = CreateExportSchema.parse(data);
      expect(result.name).toBe('Export 1');
      expect(result.sourceIds).toHaveLength(1);
    });

    it('should validate multiple source IDs', () => {
      const data = {
        name: 'Combined Export',
        sourceIds: [
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000',
        ],
        format: 'jsonl',
      };
      const result = CreateExportSchema.parse(data);
      expect(result.sourceIds).toHaveLength(2);
    });

    it('should reject empty source IDs', () => {
      const data = {
        name: 'Export',
        sourceIds: [],
        format: 'csv',
      };
      const result = CreateExportSchema.parse(data);
      expect(result.sourceIds).toEqual([]);
    });
  });
});
