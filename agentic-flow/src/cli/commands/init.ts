#!/usr/bin/env node
/**
 * CLI Init Command
 * Creates .claude/ folder structure and configuration files for Claude Code integration
 */

import * as fs from 'fs';
import * as path from 'path';

const CLAUDE_MD_TEMPLATE = `# Claude Code Configuration - Agentic Flow

## Project Setup

This project is configured with Agentic Flow for AI agent orchestration.

## Available Commands

### Quick Start
\`\`\`bash
# Start MCP server for Claude Code integration
npx agentic-flow mcp start

# Run an agent directly
npx agentic-flow --agent coder --task "Your task here"

# List available agents
npx agentic-flow --list
\`\`\`

### Hooks (Self-learning Intelligence)
\`\`\`bash
npx agentic-flow hooks pre-edit <file>    # Get context before editing
npx agentic-flow hooks post-edit <file>   # Learn from edits
npx agentic-flow hooks route <task>       # Smart agent routing
\`\`\`

### Workers (Background Tasks)
\`\`\`bash
npx agentic-flow workers status           # Check worker status
npx agentic-flow workers dispatch <task>  # Dispatch background task
\`\`\`

## Code Style

- Use TypeScript for new code
- Follow existing patterns in the codebase
- Add tests for new functionality

## Important Notes

- Never hardcode secrets - use environment variables
- Keep files under 500 lines when possible
- Write tests before implementation (TDD)
`;

const SETTINGS_TEMPLATE = {
  model: "claude-sonnet-4-20250514",
  customInstructions: "Follow the project's CLAUDE.md guidelines",
  permissions: {
    allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    deniedTools: []
  },
  mcpServers: {
    "claude-flow": {
      command: "npx",
      args: ["agentic-flow@alpha", "mcp", "start"]
    }
  }
};

const EXAMPLE_AGENT_TEMPLATE = `# Example Custom Agent

You are a specialized assistant for this project.

## Capabilities
- Code analysis and review
- Documentation generation
- Bug fixing and optimization

## Guidelines
1. Always follow the project's coding standards
2. Explain your reasoning before making changes
3. Ask clarifying questions when requirements are unclear

## Context
When working on this project, consider:
- The project structure and existing patterns
- Dependencies and their versions
- Testing requirements
`;

interface InitOptions {
  force?: boolean;
  minimal?: boolean;
  verbose?: boolean;
}

export async function handleInitCommand(args: string[]): Promise<void> {
  const options: InitOptions = {
    force: args.includes('--force') || args.includes('-f'),
    minimal: args.includes('--minimal') || args.includes('-m'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };

  if (args.includes('--help') || args.includes('-h')) {
    printInitHelp();
    return;
  }

  const cwd = process.cwd();
  const claudeDir = path.join(cwd, '.claude');
  const agentsDir = path.join(claudeDir, 'agents');
  const settingsFile = path.join(claudeDir, 'settings.json');
  const claudeMdFile = path.join(cwd, 'CLAUDE.md');

  console.log(`
╔═══════════════════════════════════════════════════════╗
║       Agentic Flow - Project Initialization           ║
╚═══════════════════════════════════════════════════════╝
`);

  // Check if already initialized
  if (fs.existsSync(claudeDir) && !options.force) {
    console.log('⚠️  .claude/ directory already exists.');
    console.log('   Use --force to overwrite existing configuration.\n');
    return;
  }

  try {
    // Create .claude directory
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
      console.log('✅ Created .claude/ directory');
    } else if (options.force) {
      console.log('⚠️  .claude/ directory exists (--force specified)');
    }

    // Create agents subdirectory
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
      console.log('✅ Created .claude/agents/ directory');
    }

    // Create settings.json
    if (!fs.existsSync(settingsFile) || options.force) {
      fs.writeFileSync(settingsFile, JSON.stringify(SETTINGS_TEMPLATE, null, 2));
      console.log('✅ Created .claude/settings.json');
    }

    // Create CLAUDE.md in project root (unless minimal mode)
    if (!options.minimal) {
      if (!fs.existsSync(claudeMdFile) || options.force) {
        fs.writeFileSync(claudeMdFile, CLAUDE_MD_TEMPLATE);
        console.log('✅ Created CLAUDE.md');
      } else {
        console.log('ℹ️  CLAUDE.md already exists (skipped)');
      }
    }

    // Create example custom agent (unless minimal mode)
    if (!options.minimal) {
      const exampleAgentFile = path.join(agentsDir, 'example-agent.md');
      if (!fs.existsSync(exampleAgentFile) || options.force) {
        fs.writeFileSync(exampleAgentFile, EXAMPLE_AGENT_TEMPLATE);
        console.log('✅ Created .claude/agents/example-agent.md');
      }
    }

    // Create commands directory for custom slash commands
    const commandsDir = path.join(claudeDir, 'commands');
    if (!fs.existsSync(commandsDir)) {
      fs.mkdirSync(commandsDir, { recursive: true });
      console.log('✅ Created .claude/commands/ directory');
    }

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                 Initialization Complete!               ║
╚═══════════════════════════════════════════════════════╝

📁 Created structure:
   .claude/
   ├── settings.json      # Claude Code settings
   ├── agents/            # Custom agent definitions
   │   └── example-agent.md
   └── commands/          # Custom slash commands
   CLAUDE.md              # Project instructions

🚀 Next steps:
   1. Start the MCP server:
      npx agentic-flow mcp start

   2. Run Claude Code:
      claude

   3. Or run agents directly:
      npx agentic-flow --agent coder --task "Your task"

📖 Documentation:
   https://github.com/ruvnet/agentic-flow
`);

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

function printInitHelp(): void {
  console.log(`
Agentic Flow - Project Initialization

USAGE:
  npx agentic-flow init [OPTIONS]

OPTIONS:
  --force, -f     Overwrite existing configuration
  --minimal, -m   Create minimal setup (no CLAUDE.md, no example agent)
  --verbose, -v   Show detailed output
  --help, -h      Show this help

EXAMPLES:
  npx agentic-flow init               # Initialize project
  npx agentic-flow init --force       # Reinitialize (overwrite existing)
  npx agentic-flow init --minimal     # Minimal setup

CREATED FILES:
  .claude/                  Claude Code configuration directory
  .claude/settings.json     Settings and MCP server configuration
  .claude/agents/           Custom agent definitions
  .claude/commands/         Custom slash commands
  CLAUDE.md                 Project instructions for Claude
`);
}

// Run if executed directly
if (process.argv[1]?.endsWith('init.js') || process.argv[1]?.endsWith('init.ts')) {
  const args = process.argv.slice(2);
  handleInitCommand(args);
}
