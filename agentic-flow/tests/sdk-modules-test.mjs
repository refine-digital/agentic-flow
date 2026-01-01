/**
 * SDK Modules Integration Tests
 * Tests: Query Control, Plugins, Streaming Input, E2B
 */
import {
  // Query Control
  createQueryController,
  getActiveQueries,
  getQueryStats,
  abortAllQueries,

  // Plugins
  loadPlugin,
  getLoadedPlugins,
  getAllPluginTools,
  executePluginTool,
  createPlugin,
  defineTool,
  unloadPlugin,

  // Streaming Input
  createTextMessage,
  createImageMessage,
  createMixedMessage,
  StreamingPromptBuilder,
  streamingPrompt,
  InteractivePromptStream,
  createInteractiveStream,
  fromArray,
  transformPrompts,
  filterPrompts,
  rateLimitPrompts,
  batchPrompts,
  toStreamingInput,

  // E2B
  E2BSandboxManager,
  isE2BAvailable
} from '../dist/sdk/index.js';

console.log('=== SDK Modules Integration Tests ===\n');

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}`);
    failed++;
  }
}

// 1. Query Control Tests
console.log('1. Query Control:');
const controller = createQueryController({ model: 'claude-sonnet-4-20250514', permissionMode: 'default' });
test('Controller created', controller !== null);
test('Has ID', controller.id.startsWith('query-'));
test('Has signal', controller.signal instanceof AbortSignal);
test('Status is running', controller.getStatus().status === 'running');

// Test model change
const modelChanged = await controller.setModel('claude-opus-4-5-20251101');
test('Model change succeeds', modelChanged);
test('Model updated', controller.getStatus().model === 'claude-opus-4-5-20251101');

// Test permission change
const permChanged = await controller.setPermissionMode('acceptEdits');
test('Permission change succeeds', permChanged);
test('Permission updated', controller.getStatus().permissionMode === 'acceptEdits');

// Test introspection
const commands = await controller.supportedCommands();
test('Has supported commands', commands.length > 5);
const models = await controller.supportedModels();
test('Has supported models', models.length >= 3);
const mcpStatus = await controller.mcpServerStatus();
test('Has MCP status', Object.keys(mcpStatus).length > 0);

// Test interrupt/resume
controller.interrupt();
test('Interrupt works', controller.getStatus().status === 'paused');
controller.resume();
test('Resume works', controller.getStatus().status === 'running');

// Test abort
const controller2 = createQueryController({ model: 'test' });
controller2.abort();
test('Abort works', controller2.getStatus().status === 'aborted');

// Test query stats
const stats = getQueryStats();
test('Stats available', stats.active >= 0 && stats.total >= 0);

// Test active queries
const active = getActiveQueries();
test('Active queries list', Array.isArray(active));

// Complete and cleanup
controller.complete({ tokenCount: 100, costUsd: 0.01 });
test('Complete works', controller.getStatus().status === 'completed');

// 2. Plugins Tests
console.log('\n2. Plugins System:');

// Create inline plugin
const testTool = defineTool({
  name: 'test-add',
  description: 'Add two numbers',
  inputSchema: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } } },
  handler: async ({ a, b }) => ({ result: a + b })
});
test('Tool definition works', testTool.name === 'test-add');

const plugin = createPlugin('test-plugin', [testTool]);
test('Plugin created', plugin.name === 'test-plugin');
test('Plugin enabled', plugin.enabled === true);
test('Plugin has tools', plugin.tools.length === 1);

// Get loaded plugins
const plugins = getLoadedPlugins();
test('Plugins list available', plugins.length >= 1);

// Get all tools
const tools = getAllPluginTools();
test('Tools list available', tools.length >= 1);

// Execute plugin tool
const result = await executePluginTool('test-add', { a: 5, b: 3 });
test('Tool execution works', result.result === 8);

// Unload plugin
const unloaded = unloadPlugin('test-plugin');
test('Unload works', unloaded === true);
test('Plugin removed', getLoadedPlugins().filter(p => p.name === 'test-plugin').length === 0);

// 3. Streaming Input Tests
console.log('\n3. Streaming Input:');

// Text message
const textMsg = createTextMessage('Hello world');
test('Text message created', textMsg.type === 'user');
test('Text content correct', textMsg.message.content[0].text === 'Hello world');

// Image message
const imgMsg = createImageMessage('base64data', 'image/png');
test('Image message created', imgMsg.message.content[0].type === 'image');
test('Image source correct', imgMsg.message.content[0].source.media_type === 'image/png');

// Mixed message
const mixedMsg = createMixedMessage([
  { type: 'text', text: 'Check this:' },
  { type: 'image', data: 'abc123' }
]);
test('Mixed message created', mixedMsg.message.content.length === 2);

// StreamingPromptBuilder
const builder = streamingPrompt()
  .text('First message')
  .text('Second message')
  .delay(0);
const builtStream = builder.build();
test('Builder created stream', builtStream[Symbol.asyncIterator] !== undefined);

// Collect builder messages
const builtMessages = [];
for await (const msg of builtStream) {
  builtMessages.push(msg);
}
test('Builder produces messages', builtMessages.length === 2);

// InteractivePromptStream
const interactive = createInteractiveStream();
test('Interactive stream created', interactive instanceof InteractivePromptStream);
test('Stream not closed', !interactive.isClosed());

interactive.pushText('Test message');
interactive.close();
test('Stream closed', interactive.isClosed());

// fromArray
const arrayStream = fromArray(['msg1', 'msg2', 'msg3']);
const arrayMessages = [];
for await (const msg of arrayStream) {
  arrayMessages.push(msg);
}
test('fromArray works', arrayMessages.length === 3);

// transformPrompts
const sourceStream = fromArray(['hello']);
const transformed = transformPrompts(sourceStream, msg => {
  msg.message.content[0].text = msg.message.content[0].text.toUpperCase();
  return msg;
});
const transformedMessages = [];
for await (const msg of transformed) {
  transformedMessages.push(msg);
}
test('Transform works', transformedMessages[0].message.content[0].text === 'HELLO');

// filterPrompts
const filterSource = fromArray(['keep', 'skip', 'keep']);
const filtered = filterPrompts(filterSource, msg => msg.message.content[0].text !== 'skip');
const filteredMessages = [];
for await (const msg of filtered) {
  filteredMessages.push(msg);
}
test('Filter works', filteredMessages.length === 2);

// batchPrompts
const batchSource = fromArray(['a', 'b', 'c', 'd', 'e']);
const batched = batchPrompts(batchSource, 2);
const batchedMessages = [];
for await (const msg of batched) {
  batchedMessages.push(msg);
}
test('Batch works', batchedMessages.length === 3); // 2 batches of 2, 1 of 1

// toStreamingInput
const fromString = toStreamingInput('single message');
const fromStringMessages = [];
for await (const msg of fromString) {
  fromStringMessages.push(msg);
}
test('toStreamingInput string', fromStringMessages.length === 1);

const fromArr = toStreamingInput(['a', 'b']);
const fromArrMessages = [];
for await (const msg of fromArr) {
  fromArrMessages.push(msg);
}
test('toStreamingInput array', fromArrMessages.length === 2);

// 4. E2B Sandbox Tests (without actual E2B API key)
console.log('\n4. E2B Sandbox:');
test('E2BSandboxManager exists', typeof E2BSandboxManager === 'function');
test('isE2BAvailable function exists', typeof isE2BAvailable === 'function');

// Check availability (will be false without API key - it's async)
const available = await isE2BAvailable();
test('E2B availability check works', typeof available === 'boolean');

// Create manager instance
const sandbox = new E2BSandboxManager({ timeout: 5000 });
test('Sandbox manager created', sandbox !== null);

// Cleanup
abortAllQueries();

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
