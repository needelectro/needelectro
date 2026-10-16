import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

test('User Profile: Name validation prevents empty or single character names', () => {
  function validateName(name) {
    if (!name || typeof name !== 'string') return false;
    const clean = name.trim();
    return clean.length >= 2;
  }

  assert.equal(validateName('Md. Rahman'), true);
  assert.equal(validateName('A'), false);
  assert.equal(validateName('   '), false);
  assert.equal(validateName(''), false);
});

test('User Profile: Phone number sanitization and format check', () => {
  function sanitizePhone(phone) {
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) return null;
    return clean;
  }

  assert.equal(sanitizePhone('01733-983752'), '01733983752');
  assert.equal(sanitizePhone('+8801733983752'), '8801733983752');
  assert.equal(sanitizePhone('123'), null);
  assert.equal(sanitizePhone(null), null);
});

test('User Profile: Password change verification logic with bcrypt', async () => {
  const currentHash = await bcrypt.hash('OldSecurePassword2026', 10);

  async function verifyAndHashPassword(currentPlain, newPlain) {
    const isCurrentValid = await bcrypt.compare(currentPlain, currentHash);
    if (!isCurrentValid) throw new Error('CURRENT_PASSWORD_INCORRECT');
    if (!newPlain || newPlain.length < 6) throw new Error('NEW_PASSWORD_TOO_SHORT');
    return bcrypt.hash(newPlain, 10);
  }

  // Valid password change
  const newHash = await verifyAndHashPassword('OldSecurePassword2026', 'NewStrongPassword2026!');
  assert.ok(newHash);
  assert.notEqual(newHash, currentHash);
  assert.equal(await bcrypt.compare('NewStrongPassword2026!', newHash), true);

  // Wrong current password
  await assert.rejects(
    async () => verifyAndHashPassword('WrongPassword', 'NewStrongPassword2026!'),
    { message: 'CURRENT_PASSWORD_INCORRECT' }
  );

  // Short new password
  await assert.rejects(
    async () => verifyAndHashPassword('OldSecurePassword2026', '123'),
    { message: 'NEW_PASSWORD_TOO_SHORT' }
  );
});

test('Customer Addresses: Default address toggling and sorting rules', () => {
  const addresses = [
    { id: 'addr_1', isDefault: false, createdAt: '2026-01-01' },
    { id: 'addr_2', isDefault: true, createdAt: '2026-01-02' },
    { id: 'addr_3', isDefault: false, createdAt: '2026-01-03' },
  ];

  // Address sorting: isDefault first, then newest createdAt
  const sorted = [...addresses].sort((a, b) => {
    if (a.isDefault === b.isDefault) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isDefault ? -1 : 1;
  });

  assert.equal(sorted[0].id, 'addr_2', 'Default address must appear first');
  assert.equal(sorted[1].id, 'addr_3');
  assert.equal(sorted[2].id, 'addr_1');
});
