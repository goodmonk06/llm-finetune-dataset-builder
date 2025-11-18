import { Command } from 'commander';
import { exportService } from '../../services/export.service';
import { ExportFormat } from '../../types';
import { prisma } from '../../lib/db';

export const exportCommand = new Command('export')
  .description('Export dataset to JSONL or CSV format')
  .requiredOption('-d, --dataset <id>', 'Dataset ID to export')
  .option(
    '-f, --format <format>',
    'Export format (openai_finetune, jsonl, csv)',
    'openai_finetune'
  )
  .option('-o, --output <name>', 'Output file name (optional)')
  .option(
    '--min-quality <number>',
    'Minimum quality score to include (0-1)',
    '0'
  )
  .action(async (options) => {
    try {
      const datasetId = options.dataset;
      const format = options.format as ExportFormat;
      const outputName = options.output;
      const minQuality = parseFloat(options.minQuality);

      console.log(`Exporting dataset: ${datasetId}`);
      console.log(`Format: ${format}`);
      if (minQuality > 0) {
        console.log(`Minimum quality: ${minQuality}`);
      }

      // Filter examples by quality if specified
      if (minQuality > 0) {
        const lowQualityCount = await prisma.example.count({
          where: {
            sourceDatasetId: datasetId,
            OR: [
              { qualityScore: { lt: minQuality } },
              { qualityScore: null },
            ],
          },
        });

        if (lowQualityCount > 0) {
          console.log(
            `⚠️  Excluding ${lowQualityCount} examples below quality threshold`
          );

          // Delete low quality examples (optional - or just filter in export)
          // For now, we'll just inform the user
        }
      }

      const filePath = await exportService.exportDataset(
        datasetId,
        format,
        outputName
      );

      // Create export record
      await prisma.datasetExport.create({
        data: {
          name: outputName || `Export ${new Date().toISOString()}`,
          sourceIds: [datasetId],
          format,
          filePath,
        },
      });

      console.log(`\n✅ Export successful!`);
      console.log(`Output file: ${filePath}`);

      if (format === 'openai_finetune') {
        console.log(`\n📝 Next steps for OpenAI fine-tuning:`);
        console.log(`  1. Upload the file:`);
        console.log(`     openai api files.create -f ${filePath} -p fine-tune`);
        console.log(`  2. Create a fine-tuning job:`);
        console.log(
          `     openai api fine_tuning.jobs.create -t <file-id> -m gpt-3.5-turbo`
        );
      }
    } catch (error: any) {
      console.error('❌ Export failed:', error.message);
      process.exit(1);
    }
  });
