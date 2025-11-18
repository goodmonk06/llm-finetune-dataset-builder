import * as fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { prisma } from '../lib/db';
import { ChatLogConversation, FAQItem, DatasetType } from '../types';

export class ImportService {
  async importChatLog(
    filePath: string,
    datasetName: string
  ): Promise<{ datasetId: string; exampleCount: number }> {
    const content = await fs.readFile(filePath, 'utf-8');
    const isCSV = filePath.endsWith('.csv');

    let conversations: ChatLogConversation[];

    if (isCSV) {
      conversations = this.parseCSVChatLog(content);
    } else {
      conversations = this.parseJSONChatLog(content);
    }

    // Create source dataset
    const dataset = await prisma.sourceDataset.create({
      data: {
        name: datasetName,
        type: 'chat_log',
        rawStorageKey: filePath,
      },
    });

    // Convert conversations to examples
    const examples = this.conversationsToExamples(conversations);

    // Batch insert examples
    await prisma.example.createMany({
      data: examples.map((ex) => ({
        sourceDatasetId: dataset.id,
        inputText: ex.input,
        outputText: ex.output,
        metaJson: ex.metadata || {},
      })),
    });

    return { datasetId: dataset.id, exampleCount: examples.length };
  }

  async importFAQ(
    filePath: string,
    datasetName: string
  ): Promise<{ datasetId: string; exampleCount: number }> {
    const content = await fs.readFile(filePath, 'utf-8');
    const isCSV = filePath.endsWith('.csv');

    let faqItems: FAQItem[];

    if (isCSV) {
      faqItems = this.parseCSVFAQ(content);
    } else {
      faqItems = this.parseJSONFAQ(content);
    }

    // Create source dataset
    const dataset = await prisma.sourceDataset.create({
      data: {
        name: datasetName,
        type: 'faq',
        rawStorageKey: filePath,
      },
    });

    // Insert FAQ items as examples
    await prisma.example.createMany({
      data: faqItems.map((item) => ({
        sourceDatasetId: dataset.id,
        inputText: item.question,
        outputText: item.answer,
        metaJson: {
          category: item.category,
          tags: item.tags,
        },
      })),
    });

    return { datasetId: dataset.id, exampleCount: faqItems.length };
  }

  private parseJSONChatLog(content: string): ChatLogConversation[] {
    const data = JSON.parse(content);

    // Handle different JSON structures
    if (Array.isArray(data)) {
      // Array of conversations
      return data;
    } else if (data.conversations) {
      // Wrapped in a conversations key
      return data.conversations;
    } else if (data.messages) {
      // Single conversation
      return [data];
    } else {
      throw new Error('Unrecognized chat log JSON format');
    }
  }

  private parseCSVChatLog(content: string): ChatLogConversation[] {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    // Group by conversation ID if present, or treat each user-assistant pair as one
    const conversations: ChatLogConversation[] = [];
    let currentConversation: ChatLogConversation = { messages: [] };

    for (const record of records) {
      const role = record.role || 'user';
      const message = record.message || record.content || '';

      if (role === 'user' && currentConversation.messages.length > 0) {
        // Start new conversation
        conversations.push(currentConversation);
        currentConversation = { messages: [] };
      }

      currentConversation.messages.push({
        role: role as 'user' | 'assistant' | 'system',
        content: message,
      });
    }

    if (currentConversation.messages.length > 0) {
      conversations.push(currentConversation);
    }

    return conversations;
  }

  private parseJSONFAQ(content: string): FAQItem[] {
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      return data;
    } else if (data.faqs || data.items) {
      return data.faqs || data.items;
    } else {
      throw new Error('Unrecognized FAQ JSON format');
    }
  }

  private parseCSVFAQ(content: string): FAQItem[] {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    return records.map((record: any) => ({
      question: record.question || record.q || '',
      answer: record.answer || record.a || '',
      category: record.category,
      tags: record.tags ? record.tags.split(',').map((t: string) => t.trim()) : [],
    }));
  }

  private conversationsToExamples(
    conversations: ChatLogConversation[]
  ): Array<{ input: string; output: string; metadata?: any }> {
    const examples: Array<{ input: string; output: string; metadata?: any }> = [];

    for (const conv of conversations) {
      const { messages } = conv;

      // Extract user-assistant pairs
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
          examples.push({
            input: messages[i].content,
            output: messages[i + 1].content,
            metadata: conv.metadata,
          });
        }
      }
    }

    return examples;
  }
}

export const importService = new ImportService();
