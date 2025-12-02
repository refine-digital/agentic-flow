#!/usr/bin/env node
/**
 * Commit Message Validator for Agentic-Flow v2.0.0-alpha
 * Enforces Conventional Commits specification
 */

const fs = require('fs');
const path = require('path');

// Conventional Commits regex
const COMMIT_MSG_REGEX = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?(!)?: .{1,100}/;

// Breaking change patterns
const BREAKING_CHANGE_REGEX = /^BREAKING CHANGE: .+/m;

function validateCommitMessage(commitMsgFile) {
  const commitMsg = fs.readFileSync(commitMsgFile, 'utf-8').trim();

  // Skip merge commits
  if (commitMsg.startsWith('Merge')) {
    console.log('ℹ️  Skipping validation for merge commit');
    return true;
  }

  // Skip revert commits
  if (commitMsg.startsWith('Revert')) {
    console.log('ℹ️  Skipping validation for revert commit');
    return true;
  }

  const lines = commitMsg.split('\n');
  const subject = lines[0];

  // Validate subject line
  if (!COMMIT_MSG_REGEX.test(subject)) {
    console.error('\n❌ Invalid commit message format!\n');
    console.error('Commit message must follow Conventional Commits specification:\n');
    console.error('  <type>(<scope>): <subject>\n');
    console.error('Examples:');
    console.error('  feat(agent): Add Byzantine consensus coordination');
    console.error('  fix(memory): Resolve memory leak in session manager');
    console.error('  docs(api): Update agent orchestration examples\n');
    console.error('Valid types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert\n');
    console.error('Your commit message:');
    console.error(`  ${subject}\n`);
    return false;
  }

  // Check for breaking change indicator
  if (subject.includes('!') && !BREAKING_CHANGE_REGEX.test(commitMsg)) {
    console.warn('\n⚠️  Warning: Breaking change indicator (!) found but no BREAKING CHANGE footer\n');
    console.warn('Consider adding a BREAKING CHANGE footer to describe the breaking change:\n');
    console.warn('  BREAKING CHANGE: Description of breaking change\n');
  }

  return true;
}

// Get commit message file from command line argument
const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error('❌ Error: Commit message file not provided');
  process.exit(1);
}

if (!fs.existsSync(commitMsgFile)) {
  console.error(`❌ Error: Commit message file not found: ${commitMsgFile}`);
  process.exit(1);
}

const isValid = validateCommitMessage(commitMsgFile);
process.exit(isValid ? 0 : 1);
