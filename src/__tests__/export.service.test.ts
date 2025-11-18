import { describe, it, expect } from 'vitest';
import { ExportService } from '../services/export.service';

describe('ExportService', () => {
  const exportService = new ExportService('./test-exports');

  describe('getExtension', () => {
    it('should return correct extension for openai_finetune format', () => {
      const ext = (exportService as any).getExtension('openai_finetune');
      expect(ext).toBe('jsonl');
    });

    it('should return correct extension for jsonl format', () => {
      const ext = (exportService as any).getExtension('jsonl');
      expect(ext).toBe('jsonl');
    });

    it('should return correct extension for csv format', () => {
      const ext = (exportService as any).getExtension('csv');
      expect(ext).toBe('csv');
    });

    it('should return txt for unknown format', () => {
      const ext = (exportService as any).getExtension('unknown');
      expect(ext).toBe('txt');
    });
  });

  describe('escapeCSV', () => {
    it('should escape double quotes in CSV', () => {
      const input = 'Text with "quotes" inside';
      const result = (exportService as any).escapeCSV(input);
      expect(result).toBe('Text with ""quotes"" inside');
    });

    it('should handle text without quotes', () => {
      const input = 'Plain text';
      const result = (exportService as any).escapeCSV(input);
      expect(result).toBe('Plain text');
    });

    it('should handle empty string', () => {
      const result = (exportService as any).escapeCSV('');
      expect(result).toBe('');
    });
  });
});
