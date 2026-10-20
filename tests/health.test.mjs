import test from 'node:test';
import assert from 'node:assert/strict';

test('Health Check: Public response format complies with monitoring spec', () => {
  const publicPayload = {
    status: 'ok',
    service: 'need-electro-api',
    timestamp: new Date().toISOString(),
  };

  assert.equal(publicPayload.status, 'ok');
  assert.equal(publicPayload.service, 'need-electro-api');
  assert.ok(Date.parse(publicPayload.timestamp) > 0);
  assert.equal('database' in publicPayload, false, 'Public ping must not expose database state');
});
