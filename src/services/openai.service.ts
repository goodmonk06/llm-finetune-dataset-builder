import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async cleanExample(input: string, output: string): Promise<{
    cleanedInput: string;
    cleanedOutput: string;
    qualityScore: number;
  }> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `You are a data cleaning assistant for LLM fine-tuning datasets.

Given this Q&A pair:
Question: ${input}
Answer: ${output}

Tasks:
1. Remove any PII (emails, phone numbers, addresses)
2. Fix obvious typos and grammar issues
3. Normalize formatting
4. Assess quality on a 0-1 scale (1 = perfect for training)

Return ONLY valid JSON with this structure:
{
  "cleanedInput": "cleaned question",
  "cleanedOutput": "cleaned answer",
  "qualityScore": 0.85
}`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    try {
      const result = JSON.parse(content);
      return {
        cleanedInput: result.cleanedInput || input,
        cleanedOutput: result.cleanedOutput || output,
        qualityScore: result.qualityScore || 0.5,
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      return { cleanedInput: input, cleanedOutput: output, qualityScore: 0.5 };
    }
  }

  async batchClean(
    examples: Array<{ input: string; output: string }>
  ): Promise<
    Array<{ cleanedInput: string; cleanedOutput: string; qualityScore: number }>
  > {
    const results = [];
    for (const example of examples) {
      try {
        const cleaned = await this.cleanExample(example.input, example.output);
        results.push(cleaned);
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error cleaning example:', error);
        results.push({
          cleanedInput: example.input,
          cleanedOutput: example.output,
          qualityScore: 0.5,
        });
      }
    }
    return results;
  }
}

export const openAIService = new OpenAIService();
