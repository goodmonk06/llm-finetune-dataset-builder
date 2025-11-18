import { Command } from 'commander';
import { importService } from '../../services/import.service';
import * as path from 'path';

export const importCommand = new Command('import-chat')
  .description('Import chat logs or FAQs from a file')
  .requiredOption('-f, --file <path>', 'Path to the input file (JSON or CSV)')
  .option('-n, --name <name>', 'Dataset name')
  .option('-t, --type <type>', 'Dataset type (chat_log or faq)', 'chat_log')
  .action(async (options) => {
    try {
      const filePath = path.resolve(options.file);
      const datasetName =
        options.name || path.basename(filePath, path.extname(filePath));
      const type = options.type;

      console.log(`Importing ${type} from: ${filePath}`);
      console.log(`Dataset name: ${datasetName}`);

      let result;
      if (type === 'faq') {
        result = await importService.importFAQ(filePath, datasetName);
      } else {
        result = await importService.importChatLog(filePath, datasetName);
      }

      console.log(`\n✅ Import successful!`);
      console.log(`Dataset ID: ${result.datasetId}`);
      console.log(`Examples imported: ${result.exampleCount}`);
      console.log(
        `\nNext steps:`
      );
      console.log(`  - Clean the data: builder clean --dataset ${result.datasetId}`);
      console.log(
        `  - Export to JSONL: builder export --dataset ${result.datasetId} --format openai_finetune`
      );
    } catch (error: any) {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    }
  });
