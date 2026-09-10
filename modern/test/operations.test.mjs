import test from 'node:test';
import assert from 'node:assert/strict';
import { runOperation, policy } from '../src/operations.mjs';
import { spawnSync } from 'node:child_process';
test('validation denied without operator opt-in', async () => {
  delete process.env.RUV_ALLOW_VALIDATION;
  await assert.rejects(runOperation('test'), /opt-in/);
  await assert.rejects(runOperation('arbitrary'), /Unknown/);
  assert.equal(policy.automaticPromotion, false);
});
test('CLI real process status and invalid command', () => {
  const result = spawnSync(process.execPath, ['src/cli.mjs', 'status'], { encoding: 'utf8' });
  assert.equal(result.status, 0); assert.equal(JSON.parse(result.stdout).writes, false);
  assert.equal(spawnSync(process.execPath, ['src/cli.mjs', 'bad']).status, 1);
});
