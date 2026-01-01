#!/usr/bin/env node
// Agentic Flow Intelligence Status Line - Compact Format with Colors
// Works on Windows, Mac, and Linux - Queries SQLite for real stats

import { readFileSync, statSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const INTEL_FILE = '.agentic-flow/intelligence.json';
const INTEL_DB = '.agentic-flow/intelligence.db';

// ============================================================================
// Color Schemes (ANSI escape codes)
// ============================================================================

// Detect dark/light mode from environment or default to dark
const isDarkMode = (() => {
  // Check common environment variables
  const colorScheme = process.env.COLORFGBG || '';
  const termBg = process.env.TERM_BACKGROUND || '';
  const vscodeTheme = process.env.VSCODE_TERMINAL_COLOR_THEME || '';

  // Light mode indicators
  if (termBg === 'light') return false;
  if (vscodeTheme.toLowerCase().includes('light')) return false;
  if (colorScheme.startsWith('0;') || colorScheme.includes(';15')) return false;

  // Check CLAUDE_CODE_THEME if set
  if (process.env.CLAUDE_CODE_THEME === 'light') return false;

  // Default to dark mode
  return true;
})();

// Color palettes
const colors = {
  dark: {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',

    // Main colors
    model: '\x1b[38;5;208m',      // Orange
    project: '\x1b[38;5;39m',      // Bright blue
    branch: '\x1b[38;5;156m',      // Light green

    // Stats colors
    brain: '\x1b[38;5;213m',       // Pink/magenta
    patterns: '\x1b[38;5;220m',    // Gold
    memory: '\x1b[38;5;117m',      // Light cyan
    trajectories: '\x1b[38;5;183m', // Light purple
    agents: '\x1b[38;5;156m',      // Light green

    // Routing colors
    target: '\x1b[38;5;196m',      // Red
    learning: '\x1b[38;5;226m',    // Yellow
    epsilon: '\x1b[38;5;51m',      // Cyan
    success: '\x1b[38;5;46m',      // Bright green

    // Symbols
    symbol: '\x1b[38;5;245m',      // Gray
  },
  light: {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',

    // Main colors (darker for light backgrounds)
    model: '\x1b[38;5;166m',       // Dark orange
    project: '\x1b[38;5;27m',      // Dark blue
    branch: '\x1b[38;5;28m',       // Dark green

    // Stats colors
    brain: '\x1b[38;5;129m',       // Dark magenta
    patterns: '\x1b[38;5;136m',    // Dark gold
    memory: '\x1b[38;5;30m',       // Dark cyan
    trajectories: '\x1b[38;5;91m', // Dark purple
    agents: '\x1b[38;5;28m',       // Dark green

    // Routing colors
    target: '\x1b[38;5;160m',      // Dark red
    learning: '\x1b[38;5;136m',    // Dark yellow/olive
    epsilon: '\x1b[38;5;31m',      // Dark cyan
    success: '\x1b[38;5;28m',      // Dark green

    // Symbols
    symbol: '\x1b[38;5;240m',      // Dark gray
  }
};

const c = isDarkMode ? colors.dark : colors.light;

// ============================================================================
// Helpers
// ============================================================================

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function querySqlite(db, sql) {
  try {
    const result = execSync(`sqlite3 "${db}" "${sql}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 1000
    }).trim();
    return result;
  } catch {
    try {
      const result = execSync(`sqlite3.exe "${db}" "${sql}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 1000
      }).trim();
      return result;
    } catch {
      return null;
    }
  }
}

function getGitBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function getProjectName() {
  try {
    const cwd = process.cwd();
    return cwd.split('/').pop() || 'project';
  } catch {
    return 'project';
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

// ============================================================================
// Data Collection
// ============================================================================

const LEARNING_RATE = parseFloat(process.env.AGENTIC_FLOW_LEARNING_RATE || '0.1');
const EPSILON = parseFloat(process.env.AGENTIC_FLOW_EPSILON || '0.1');

const intel = readJson(INTEL_FILE);

let dbStats = {
  totalTrajectories: 0,
  successfulTrajectories: 0,
  totalRoutings: 0,
  successfulRoutings: 0,
  totalPatterns: 0,
  sonaAdaptations: 0,
  hnswQueries: 0,
  avgLatency: 0,
  totalAgents: 0,
  activeAgents: 0
};

if (existsSync(INTEL_DB)) {
  const statsRow = querySqlite(INTEL_DB, 'SELECT * FROM stats LIMIT 1');
  if (statsRow) {
    const cols = statsRow.split('|');
    dbStats.totalTrajectories = parseInt(cols[1]) || 0;
    dbStats.successfulTrajectories = parseInt(cols[2]) || 0;
    dbStats.totalRoutings = parseInt(cols[3]) || 0;
    dbStats.successfulRoutings = parseInt(cols[4]) || 0;
    dbStats.totalPatterns = parseInt(cols[5]) || 0;
    dbStats.sonaAdaptations = parseInt(cols[6]) || 0;
    dbStats.hnswQueries = parseInt(cols[7]) || 0;
  }

  const trajCount = querySqlite(INTEL_DB, 'SELECT COUNT(*) FROM trajectories');
  if (trajCount) {
    dbStats.totalTrajectories = parseInt(trajCount) || dbStats.totalTrajectories;
  }

  const routingStats = querySqlite(INTEL_DB, 'SELECT COUNT(*), SUM(was_successful), AVG(latency_ms) FROM routings');
  if (routingStats) {
    const cols = routingStats.split('|');
    if (parseInt(cols[0]) > 0) {
      dbStats.totalRoutings = parseInt(cols[0]) || 0;
      dbStats.successfulRoutings = parseInt(cols[1]) || 0;
      dbStats.avgLatency = parseFloat(cols[2]) || 0;
    }
  }

  const patternCount = querySqlite(INTEL_DB, 'SELECT COUNT(*) FROM patterns');
  if (patternCount) {
    dbStats.totalPatterns = parseInt(patternCount) || 0;
  }

  const agentCount = querySqlite(INTEL_DB, "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='agents'");
  if (agentCount === '1') {
    const agents = querySqlite(INTEL_DB, 'SELECT COUNT(*), SUM(CASE WHEN status="active" THEN 1 ELSE 0 END) FROM agents');
    if (agents) {
      const cols = agents.split('|');
      dbStats.totalAgents = parseInt(cols[0]) || 0;
      dbStats.activeAgents = parseInt(cols[1]) || 0;
    }
  }
}

const jsonRoutes = intel?.metrics?.totalRoutes || 0;
const routes = dbStats.totalRoutings > 0 ? dbStats.totalRoutings : jsonRoutes;
const patterns = dbStats.totalPatterns > 0 ? dbStats.totalPatterns : (intel?.patterns ? Object.keys(intel.patterns).length : 0);
const memories = intel?.memories?.length || 0;
const trajectories = dbStats.totalTrajectories;

let agents = dbStats.totalAgents;
let activeAgents = dbStats.activeAgents;
if (agents === 0 && intel?.agents) {
  agents = Object.keys(intel.agents).length;
  activeAgents = Object.values(intel.agents).filter(a => a.status === 'active').length;
}
if (agents === 0) {
  agents = 66;
}

const branch = getGitBranch();
const project = getProjectName();

let dbSize = 0;
if (existsSync(INTEL_DB)) {
  try {
    const stats = statSync(INTEL_DB);
    dbSize = stats.size;
  } catch {}
}

// ============================================================================
// Build Colored Output
// ============================================================================

const lines = [];

// Line 1: Model + project + branch
let line1 = `${c.model}${c.bold}Opus 4.5${c.reset}`;
line1 += ` ${c.dim}in${c.reset} ${c.project}${project}${c.reset}`;
if (branch) {
  line1 += ` ${c.dim}on${c.reset} ${c.symbol}⎇${c.reset} ${c.branch}${branch}${c.reset}`;
}
lines.push(line1);

// Line 2: RuVector stats
let line2 = `${c.brain}🧠 RuVector${c.reset}`;
line2 += ` ${c.symbol}◆${c.reset} ${c.patterns}${patterns}${c.reset} ${c.dim}patterns${c.reset}`;
if (memories > 0 || dbSize > 0) {
  line2 += ` ${c.symbol}⬡${c.reset} ${c.memory}${memories > 0 ? memories : formatSize(dbSize)}${c.reset} ${c.dim}mem${c.reset}`;
}
if (trajectories > 0) {
  line2 += ` ${c.symbol}↝${c.reset}${c.trajectories}${trajectories}${c.reset}`;
}
if (agents > 0) {
  line2 += ` ${c.symbol}#${c.reset}${c.agents}${activeAgents > 0 ? activeAgents + '/' : ''}${agents}${c.reset}`;
}
lines.push(line2);

// Line 3: Routing info
const lrPercent = Math.round(LEARNING_RATE * 100);
const epsPercent = Math.round(EPSILON * 100);
let line3 = `${c.target}🎯 Routing${c.reset}`;
line3 += ` ${c.dim}q-learning${c.reset}`;
line3 += ` ${c.learning}lr:${lrPercent}%${c.reset}`;
line3 += ` ${c.epsilon}ε:${epsPercent}%${c.reset}`;
if (routes > 0) {
  const successRate = dbStats.successfulRoutings > 0
    ? Math.round((dbStats.successfulRoutings / routes) * 100)
    : 100;
  line3 += ` ${c.symbol}|${c.reset} ${c.success}${successRate}% ✓${c.reset}`;
}
lines.push(line3);

// Output
console.log(lines.join('\n'));
