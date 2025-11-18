import { describe, it, expect } from 'vitest';
import { ImportService } from '../services/import.service';

describe('ImportService', () => {
  const importService = new ImportService();

  describe('parseJSONChatLog', () => {
    it('should parse array of conversations', () => {
      const json = JSON.stringify([
        {
          messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' },
          ],
        },
      ]);

      const result = (importService as any).parseJSONChatLog(json);
      expect(result).toHaveLength(1);
      expect(result[0].messages).toHaveLength(2);
      expect(result[0].messages[0].role).toBe('user');
    });

    it('should parse conversations wrapped in key', () => {
      const json = JSON.stringify({
        conversations: [
          {
            messages: [
              { role: 'user', content: 'Test' },
              { role: 'assistant', content: 'Response' },
            ],
          },
        ],
      });

      const result = (importService as any).parseJSONChatLog(json);
      expect(result).toHaveLength(1);
    });

    it('should parse single conversation', () => {
      const json = JSON.stringify({
        messages: [
          { role: 'user', content: 'Question' },
          { role: 'assistant', content: 'Answer' },
        ],
      });

      const result = (importService as any).parseJSONChatLog(json);
      expect(result).toHaveLength(1);
    });
  });

  describe('conversationsToExamples', () => {
    it('should extract user-assistant pairs', () => {
      const conversations = [
        {
          messages: [
            { role: 'user', content: 'Question 1' },
            { role: 'assistant', content: 'Answer 1' },
            { role: 'user', content: 'Question 2' },
            { role: 'assistant', content: 'Answer 2' },
          ],
        },
      ];

      const examples = (importService as any).conversationsToExamples(conversations);
      expect(examples).toHaveLength(2);
      expect(examples[0].input).toBe('Question 1');
      expect(examples[0].output).toBe('Answer 1');
      expect(examples[1].input).toBe('Question 2');
      expect(examples[1].output).toBe('Answer 2');
    });

    it('should handle mixed role sequences', () => {
      const conversations = [
        {
          messages: [
            { role: 'system', content: 'System message' },
            { role: 'user', content: 'User question' },
            { role: 'assistant', content: 'Assistant answer' },
          ],
        },
      ];

      const examples = (importService as any).conversationsToExamples(conversations);
      expect(examples).toHaveLength(1);
      expect(examples[0].input).toBe('User question');
    });

    it('should preserve metadata', () => {
      const conversations = [
        {
          messages: [
            { role: 'user', content: 'Q' },
            { role: 'assistant', content: 'A' },
          ],
          metadata: { category: 'test', priority: 'high' },
        },
      ];

      const examples = (importService as any).conversationsToExamples(conversations);
      expect(examples[0].metadata).toEqual({ category: 'test', priority: 'high' });
    });
  });

  describe('parseJSONFAQ', () => {
    it('should parse array of FAQ items', () => {
      const json = JSON.stringify([
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ]);

      const result = (importService as any).parseJSONFAQ(json);
      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('Q1');
      expect(result[0].answer).toBe('A1');
    });

    it('should parse FAQ items wrapped in key', () => {
      const json = JSON.stringify({
        faqs: [{ question: 'Q', answer: 'A' }],
      });

      const result = (importService as any).parseJSONFAQ(json);
      expect(result).toHaveLength(1);
    });
  });
});
