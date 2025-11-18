import { Command } from 'commander';
import { prisma } from '../../lib/db';
import { openAIService } from '../../services/openai.service';

export const cleanCommand = new Command('clean')
  .description('Clean and normalize dataset examples using OpenAI')
  .requiredOption('-d, --dataset <id>', 'Dataset ID to clean')
  .option('-l, --limit <number>', 'Limit number of examples to clean', '100')
  .option(
    '--quality-threshold <number>',
    'Minimum quality score to keep (0-1)',
    '0.5'
  )
  .action(async (options) => {
    try {
      if (!openAIService.isConfigured()) {
        console.error('❌ OpenAI API key not configured');
        console.error('Please set OPENAI_API_KEY in your .env file');
        process.exit(1);
      }

      const datasetId = options.dataset;
      const limit = parseInt(options.limit, 10);
      const qualityThreshold = parseFloat(options.qualityThreshold);

      console.log(`Cleaning dataset: ${datasetId}`);
      console.log(`Processing up to ${limit} examples...`);

      // Fetch examples
      const examples = await prisma.example.findMany({
        where: { sourceDatasetId: datasetId },
        take: limit,
      });

      if (examples.length === 0) {
        console.log('No examples found in this dataset');
        return;
      }

      console.log(`Found ${examples.length} examples to clean\n`);

      let cleaned = 0;
      let updated = 0;
      let lowQuality = 0;

      // Clean examples one by one
      for (let i = 0; i < examples.length; i++) {
        const example = examples[i];
        process.stdout.write(`Processing ${i + 1}/${examples.length}... `);

        try {
          const result = await openAIService.cleanExample(
            example.inputText,
            example.outputText
          );

          // Update the example
          await prisma.example.update({
            where: { id: example.id },
            data: {
              inputText: result.cleanedInput,
              outputText: result.cleanedOutput,
              qualityScore: result.qualityScore,
            },
          });

          cleaned++;
          if (result.qualityScore < qualityThreshold) {
            lowQuality++;
            console.log(`⚠️  Low quality (${result.qualityScore.toFixed(2)})`);
          } else {
            updated++;
            console.log(`✅ (${result.qualityScore.toFixed(2)})`);
          }
        } catch (error: any) {
          console.log(`❌ Error: ${error.message}`);
        }
      }

      console.log(`\n📊 Cleaning complete!`);
      console.log(`Total processed: ${cleaned}`);
      console.log(`High quality (>=${qualityThreshold}): ${updated}`);
      console.log(`Low quality (<${qualityThreshold}): ${lowQuality}`);

      if (lowQuality > 0) {
        console.log(
          `\n💡 Consider removing low quality examples before export`
        );
      }
    } catch (error: any) {
      console.error('❌ Cleaning failed:', error.message);
      process.exit(1);
    }
  });
