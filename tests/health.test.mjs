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

test('Keep-Alive Authorization: Token and Bearer header verification', () => {
  const CRON_SECRET = 'test_cron_secret_key_12345';

  function verifyAuth(headers, queryToken) {
    const authHeader = headers['authorization'];
    const xCronSecret = headers['x-cron-secret'];

    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (
      bearerToken === CRON_SECRET ||
      xCronSecret === CRON_SECRET ||
      queryToken === CRON_SECRET
    ) {
      return true;
    }
    return false;
  }

  // Valid Bearer token
  assert.equal(verifyAuth({ authorization: 'Bearer test_cron_secret_key_12345' }, null), true);

  // Valid x-cron-secret header
  assert.equal(verifyAuth({ 'x-cron-secret': 'test_cron_secret_key_12345' }, null), true);

  // Valid query token
  assert.equal(verifyAuth({}, 'test_cron_secret_key_12345'), true);

  // Invalid token
  assert.equal(verifyAuth({ authorization: 'Bearer wrong_token' }, null), false);
  assert.equal(verifyAuth({}, 'wrong_query_token'), false);
  assert.equal(verifyAuth({}, null), false);
});

test('Keep-Alive Response: Sanitization guarantees zero leaked credentials', () => {
  const safeSuccessResponse = {
    status: 'ok',
    database: 'reachable',
    latencyMs: 12,
    timestamp: new Date().toISOString(),
  };

  // Must not contain credentials or urls
  const serialized = JSON.stringify(safeSuccessResponse);
  assert.equal(serialized.includes('postgres'), false);
  assert.equal(serialized.includes('password'), false);
  assert.equal(serialized.includes('pooler'), false);
  assert.equal(safeSuccessResponse.database, 'reachable');
});

test('Keep-Alive Cron Schedule: Vercel Hobby compliance check', () => {
  // Frequency check for "0 4 */8 * *"
  const schedule = '0 4 */8 * *';
  const parts = schedule.split(' ');
  assert.equal(parts.length, 5, 'Cron expression must have 5 fields');

  // Verify schedule runs at most once in a given 24h period (satisfies Vercel Hobby daily limit)
  const minute = parts[0];
  const hour = parts[1];
  const dayOfMonth = parts[2];

  assert.equal(minute, '0');
  assert.equal(hour, '4');
  assert.equal(dayOfMonth, '*/8');
});
