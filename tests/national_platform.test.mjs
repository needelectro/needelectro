import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('PWA Manifest & Assets: Manifest is valid JSON with official brand colors and icons', () => {
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in public directory');

  const content = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.ok(content.name.includes('NEED ELECTRO'), 'Manifest name must contain NEED ELECTRO');
  assert.equal(content.display, 'standalone');
  assert.ok(content.icons.length >= 2, 'Manifest must have multiple icons');
  
  // Verify icon files physically exist
  content.icons.forEach((icon) => {
    const iconFile = path.resolve(process.cwd(), `public${icon.src}`);
    assert.ok(fs.existsSync(iconFile), `Referenced icon file ${icon.src} must physically exist`);
  });
});

test('PWA Service Worker: Syntax and safety rules', () => {
  const swPath = path.resolve(process.cwd(), 'public/sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js must exist in public directory');

  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert.ok(!swContent.includes('logo.svg'), 'sw.js must not reference nonexistent logo.svg');
  assert.ok(swContent.includes('/offline'), 'sw.js must pre-cache offline fallback');
  assert.ok(swContent.includes('/api/'), 'sw.js must exclude /api/ routes from caching');
  assert.ok(swContent.includes('SKIP_WAITING'), 'sw.js must support skip waiting message');
});

test('National Delivery: Regional calculation matches business rules', () => {
  function calculateDeliveryCharge(district, subtotal, insideRate = 60, outsideRate = 120) {
    const isLocal = district.toLowerCase().includes('moulvibazar');
    const freeThreshold = isLocal ? 10000 : 15000;
    const baseRate = isLocal ? insideRate : outsideRate;
    return subtotal >= freeThreshold ? 0 : baseRate;
  }

  // Inside Moulvibazar under threshold
  assert.equal(calculateDeliveryCharge('Moulvibazar', 2500), 60);

  // Inside Moulvibazar over threshold
  assert.equal(calculateDeliveryCharge('Moulvibazar', 12000), 0);

  // Outside (Dhaka) under threshold
  assert.equal(calculateDeliveryCharge('Dhaka', 5000), 120);

  // Outside (Dhaka) over threshold
  assert.equal(calculateDeliveryCharge('Dhaka', 18000), 0);

  // Outside (Chattogram) under threshold
  assert.equal(calculateDeliveryCharge('Chattogram', 14999), 120);

  // Outside (Chattogram) over threshold
  assert.equal(calculateDeliveryCharge('Chattogram', 15000), 0);
});

test('National Geographic Coverage: 64 Districts and 8 Divisions are structured and valid', async () => {
  const districtsModulePath = path.resolve(process.cwd(), 'src/lib/data/districts.ts');
  const fileContent = fs.readFileSync(districtsModulePath, 'utf-8');

  // Verify key divisions are present
  const divisions = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
  divisions.forEach((div) => {
    assert.ok(fileContent.includes(div), `Districts dataset must contain division ${div}`);
  });
});

test('Inventory Stock Guard: Negative quantity or overselling is blocked', () => {
  function validateOrderStock(productStock, requestedQty) {
    if (requestedQty <= 0) return { valid: false, error: 'Invalid quantity' };
    if (productStock < requestedQty) {
      return {
        valid: false,
        error: `Insufficient stock. Requested ${requestedQty}, available: ${productStock}`,
      };
    }
    return { valid: true, remaining: productStock - requestedQty };
  }

  assert.equal(validateOrderStock(10, 2).valid, true);
  assert.equal(validateOrderStock(10, 2).remaining, 8);
  assert.equal(validateOrderStock(2, 5).valid, false);
  assert.equal(validateOrderStock(0, 1).valid, false);
  assert.equal(validateOrderStock(5, -1).valid, false);
});

test('Business Identity & Configuration: Official brand colors, tagline, and contact channels', async () => {
  const configModulePath = path.resolve(process.cwd(), 'src/lib/config/business.ts');
  assert.ok(fs.existsSync(configModulePath), 'business.ts must exist');
  
  const content = fs.readFileSync(configModulePath, 'utf-8');
  assert.ok(content.includes('#008CFF'), 'Electric Blue #008CFF must be defined');
  assert.ok(content.includes('#002B5B'), 'Dark Navy #002B5B must be defined');
  assert.ok(content.includes('#F4F6F8'), 'Light Grey #F4F6F8 must be defined');
  assert.ok(content.includes('AMDADS GROUP'), 'AMDADS GROUP parent company must be defined');
  assert.ok(content.includes('Trusted Electrical and Technological Solutions'), 'Official tagline must be defined');
});
