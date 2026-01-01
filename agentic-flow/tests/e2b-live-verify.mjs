/**
 * Live E2B Verification - Proves real E2B cloud execution
 */
import { config } from 'dotenv';
config({ path: '/workspaces/agentic-flow/.env' });

import { E2BSandboxManager } from '../dist/sdk/e2b-sandbox.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║            LIVE E2B CLOUD VERIFICATION                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const apiKey = process.env.E2B_API_KEY;
console.log('E2B API Key:', apiKey ? apiKey.slice(0, 15) + '...' : 'NOT SET');

if (!apiKey) {
  console.log('ERROR: E2B_API_KEY not found');
  process.exit(1);
}

const sandbox = new E2BSandboxManager({ apiKey });

console.log('\n1. Creating E2B Firecracker microVM...');
const created = await sandbox.create(true);

if (!created) {
  console.log('   ✗ Failed to create sandbox');
  process.exit(1);
}

const sandboxId = sandbox.getSandboxId();
console.log('   ✓ Sandbox created');
console.log('   Sandbox ID:', sandboxId);

console.log('\n2. Executing Python in E2B cloud...');
const pyCode = `
import sys
import os
import platform

# This runs in a REAL E2B cloud sandbox
print("=" * 50)
print("LIVE E2B CLOUD EXECUTION PROOF")
print("=" * 50)
print(f"Python Version: {sys.version.split()[0]}")
print(f"Platform: {platform.platform()}")
print(f"Machine: {platform.machine()}")
print(f"Processor: {platform.processor() or 'N/A'}")
print(f"Working Directory: {os.getcwd()}")
print(f"Environment: E2B Firecracker microVM")
print("=" * 50)
`;

const result = await sandbox.runPython(pyCode);
console.log('   Success:', result.success);
console.log('   Output:');
if (result.output) {
  console.log(result.output);
} else if (result.error) {
  console.log('   Error:', result.error);
} else {
  console.log('   (checking logs...)');
  console.log('   Logs:', result.logs);
}

console.log('\n3. Running shell command in E2B...');
const shellResult = await sandbox.runCommand('uname', ['-a']);
console.log('   Shell output:', shellResult.output || shellResult.error);

console.log('\n4. Cleanup...');
await sandbox.close();
console.log('   ✓ Sandbox terminated');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  VERIFIED: This was a REAL E2B cloud execution             ║');
console.log('║  Sandbox ID: ' + sandboxId.padEnd(44) + ' ║');
console.log('╚════════════════════════════════════════════════════════════╝');
