import * as fs from 'fs/promises';
import * as path from 'path';
import { prisma } from '../lib/db';
import { ExportFormat, OpenAIFineTuneExample } from '../types';

export class ExportService {
  private outputDir: string;

  constructor(outputDir = './exports') {
    this.outputDir = outputDir;
  }

  async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  async exportDataset(
    datasetId: string,
    format: ExportFormat,
    outputName?: string
  ): Promise<string> {
    await this.ensureOutputDir();

    const examples = await prisma.example.findMany({
      where: { sourceDatasetId: datasetId },
      orderBy: { createdAt: 'asc' },
    });

    if (examples.length === 0) {
      throw new Error('No examples found for this dataset');
    }

    const fileName =
      outputName || `export_${datasetId}_${Date.now()}.${this.getExtension(format)}`;
    const filePath = path.join(this.outputDir, fileName);

    switch (format) {
      case 'openai_finetune':
        await this.exportOpenAIFormat(examples, filePath);
        break;
      case 'jsonl':
        await this.exportJSONL(examples, filePath);
        break;
      case 'csv':
        await this.exportCSV(examples, filePath);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return filePath;
  }

  private async exportOpenAIFormat(
    examples: any[],
    filePath: string
  ): Promise<void> {
    const lines: string[] = [];

    for (const example of examples) {
      const finetuneLine: OpenAIFineTuneExample = {
        messages: [
          { role: 'user', content: example.inputText },
          { role: 'assistant', content: example.outputText },
        ],
      };
      lines.push(JSON.stringify(finetuneLine));
    }

    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
  }

  private async exportJSONL(examples: any[], filePath: string): Promise<void> {
    const lines = examples.map((ex) =>
      JSON.stringify({
        input: ex.inputText,
        output: ex.outputText,
        metadata: ex.metaJson,
        quality: ex.qualityScore,
      })
    );
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
  }

  private async exportCSV(examples: any[], filePath: string): Promise<void> {
    const header = 'input,output,quality\n';
    const rows = examples.map(
      (ex) =>
        `"${this.escapeCSV(ex.inputText)}","${this.escapeCSV(ex.outputText)}",${ex.qualityScore || ''}`
    );
    await fs.writeFile(filePath, header + rows.join('\n'), 'utf-8');
  }

  private escapeCSV(text: string): string {
    return text.replace(/"/g, '""');
  }

  private getExtension(format: ExportFormat): string {
    switch (format) {
      case 'openai_finetune':
        return 'jsonl';
      case 'jsonl':
        return 'jsonl';
      case 'csv':
        return 'csv';
      default:
        return 'txt';
    }
  }
}

export const exportService = new ExportService();
