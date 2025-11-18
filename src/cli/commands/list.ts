import { Command } from 'commander';
import { prisma } from '../../lib/db';

export const listCommand = new Command('list')
  .description('List datasets and their statistics')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    try {
      const datasets = await prisma.sourceDataset.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { examples: true },
          },
        },
      });

      if (datasets.length === 0) {
        console.log('No datasets found. Import some data first!');
        console.log('\nExample:');
        console.log('  builder import-chat --file ./data/chats.json');
        return;
      }

      console.log(`\n📚 Datasets (${datasets.length} total)\n`);

      for (const dataset of datasets) {
        console.log(`ID: ${dataset.id}`);
        console.log(`Name: ${dataset.name}`);
        console.log(`Type: ${dataset.type}`);
        console.log(`Examples: ${dataset._count.examples}`);
        console.log(`Created: ${dataset.createdAt.toLocaleString()}`);

        if (options.verbose && dataset._count.examples > 0) {
          // Show sample examples
          const samples = await prisma.example.findMany({
            where: { sourceDatasetId: dataset.id },
            take: 2,
          });

          console.log('\nSample examples:');
          for (const sample of samples) {
            console.log(
              `  Q: ${sample.inputText.substring(0, 60)}${sample.inputText.length > 60 ? '...' : ''}`
            );
            console.log(
              `  A: ${sample.outputText.substring(0, 60)}${sample.outputText.length > 60 ? '...' : ''}`
            );
            if (sample.qualityScore) {
              console.log(`  Quality: ${sample.qualityScore.toFixed(2)}`);
            }
            console.log();
          }
        }

        console.log('---\n');
      }

      // Show exports
      const exports = await prisma.datasetExport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (exports.length > 0) {
        console.log(`\n📤 Recent exports (${exports.length})\n`);
        for (const exp of exports) {
          console.log(`${exp.name} - ${exp.format} - ${exp.filePath}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error listing datasets:', error.message);
      process.exit(1);
    }
  });
