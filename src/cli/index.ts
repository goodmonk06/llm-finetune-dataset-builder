#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { importCommand } from './commands/import';
import { cleanCommand } from './commands/clean';
import { exportCommand } from './commands/export';
import { listCommand } from './commands/list';

// Load environment variables
config();

const program = new Command();

program
  .name('builder')
  .description('LLM Fine-tune Dataset Builder CLI')
  .version('1.0.0');

// Register commands
program.addCommand(importCommand);
program.addCommand(cleanCommand);
program.addCommand(exportCommand);
program.addCommand(listCommand);

program.parse(process.argv);
