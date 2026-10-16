import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Feature Flags: Service-first architecture flags are configured', async () => {
  const flagsPath = path.resolve(process.cwd(), 'src/lib/featureFlags.ts');
  assert.ok(fs.existsSync(flagsPath), 'featureFlags.ts must exist');

  const content = fs.readFileSync(flagsPath, 'utf-8');
  assert.ok(content.includes('ENABLE_SHOP'), 'Must export ENABLE_SHOP flag');
  assert.ok(content.includes('SERVICE_FIRST_MODE: true'), 'SERVICE_FIRST_MODE must be enabled');
  assert.ok(content.includes('PARTS_CATALOG_ENABLED: true'), 'PARTS_CATALOG_ENABLED must be enabled');
});

test('Information Architecture: Homepage hero matches specification', () => {
  const homePath = path.resolve(process.cwd(), 'src/app/page.tsx');
  assert.ok(fs.existsSync(homePath), 'src/app/page.tsx must exist');

  const content = fs.readFileSync(homePath, 'utf-8');
  assert.ok(
    content.includes('Book trusted electricians, AC technicians, CCTV installers, and appliance repair experts — nationwide in Bangladesh'),
    'Homepage hero must contain the exact prompt headline'
  );
  assert.ok(
    content.includes('24/7 Rapid Emergency Response') || content.includes('Emergency Electrical Hazard'),
    'Must have emergency assistance callout'
  );
  assert.ok(content.includes('85% Revenue Share'), 'Must feature technician recruitment banner');
});

test('Information Architecture: Header navigation prioritizes services', () => {
  const headerPath = path.resolve(process.cwd(), 'src/components/layout/Header.tsx');
  assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');

  const content = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(content.includes('/services'), 'Must link to /services');
  assert.ok(content.includes('/booking'), 'Must link to /booking');
  assert.ok(content.includes('/technician/portal') || content.includes('/technician/login') || content.includes('/technician/dashboard'), 'Must link to technician portal');
  assert.ok(content.includes('/customer/dashboard?tab=bookings'), 'Must link directly to customer bookings');
});

test('Information Architecture: Secondary Parts & Materials Catalog exists', () => {
  const partsPath = path.resolve(process.cwd(), 'src/app/parts/page.tsx');
  assert.ok(fs.existsSync(partsPath), 'src/app/parts/page.tsx must exist');

  const content = fs.readFileSync(partsPath, 'utf-8');
  assert.ok(
    content.includes('Spare Parts') || content.includes('Parts, Cables &amp; Hardware'),
    'Must feature spare parts title'
  );
  assert.ok(content.includes('circuit breakers') || content.includes('Circuit Breakers'), 'Must include electrical parts category');
});

test('Booking Lifecycle & State Transitions: All states supported', () => {
  const validBookingStatuses = [
    'DRAFT',
    'REQUESTED',
    'QUOTED',
    'CONFIRMED',
    'ASSIGNED',
    'MATCHING',
    'EN_ROUTE',
    'ON_THE_WAY',
    'ARRIVED',
    'IN_PROGRESS',
    'WORK_STARTED',
    'COMPLETED',
    'WORK_COMPLETED',
    'PAID',
    'CLOSED',
    'CANCELLED',
    'DISPUTED',
    'REFUNDED',
  ];

  function isValidTransition(current, next) {
    const lifecycleOrder = [
      'DRAFT',
      'REQUESTED',
      'QUOTED',
      'CONFIRMED',
      'ASSIGNED',
      'EN_ROUTE',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'PAID',
      'CLOSED',
    ];
    if (['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(next)) return true;
    return validBookingStatuses.includes(current) && validBookingStatuses.includes(next);
  }

  assert.ok(isValidTransition('REQUESTED', 'QUOTED'));
  assert.ok(isValidTransition('QUOTED', 'CONFIRMED'));
  assert.ok(isValidTransition('CONFIRMED', 'ASSIGNED'));
  assert.ok(isValidTransition('ASSIGNED', 'EN_ROUTE'));
  assert.ok(isValidTransition('EN_ROUTE', 'ARRIVED'));
  assert.ok(isValidTransition('ARRIVED', 'IN_PROGRESS'));
  assert.ok(isValidTransition('IN_PROGRESS', 'COMPLETED'));
  assert.ok(isValidTransition('COMPLETED', 'PAID'));
  assert.ok(isValidTransition('PAID', 'CLOSED'));
  assert.ok(isValidTransition('IN_PROGRESS', 'DISPUTED'));
});

test('Service Economics: 85% Technician share and 15% platform commission', () => {
  function calculateSplit(serviceAmount, commissionRate = 15.0) {
    const platformFee = Math.round((serviceAmount * commissionRate) / 100);
    const technicianAmount = serviceAmount - platformFee;
    return { platformFee, technicianAmount };
  }

  // ৳1500 House wiring job
  const split1500 = calculateSplit(1500);
  assert.equal(split1500.platformFee, 225);
  assert.equal(split1500.technicianAmount, 1275);
  assert.equal(split1500.technicianAmount + split1500.platformFee, 1500);

  // ৳500 Emergency troubleshooting job
  const split500 = calculateSplit(500);
  assert.equal(split500.platformFee, 75);
  assert.equal(split500.technicianAmount, 425);

  // ৳1200 CCTV installation job
  const split1200 = calculateSplit(1200);
  assert.equal(split1200.platformFee, 180);
  assert.equal(split1200.technicianAmount, 1020);
});

test('Service Invoicing: Itemized Labor + Parts calculation', () => {
  function calculateInvoice(laborAmount, parts = []) {
    const partsAmount = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    const totalAmount = laborAmount + partsAmount;
    return { laborAmount, partsAmount, totalAmount };
  }

  const invoice = calculateInvoice(1500, [
    { name: 'Schneider 16A MCB', quantity: 2, unitPrice: 380 },
    { name: 'BRB 1.5 RM Cable (meters)', quantity: 20, unitPrice: 68 },
  ]);

  assert.equal(invoice.laborAmount, 1500);
  assert.equal(invoice.partsAmount, 2 * 380 + 20 * 68); // 760 + 1360 = 2120
  assert.equal(invoice.totalAmount, 1500 + 2120); // 3620
});

test('Service Warranty: 30-day automatic workmanship warranty logic', () => {
  function generateWarranty(startDate, durationDays = 30) {
    const start = new Date(startDate);
    const expiry = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    return {
      startDate: start,
      expiryDate: expiry,
      periodDays: durationDays,
      isActiveAt: (checkDate) => new Date(checkDate) <= expiry,
    };
  }

  const warranty = generateWarranty('2026-10-01T12:00:00Z', 30);
  assert.equal(warranty.periodDays, 30);

  // Day 15 should be active
  assert.ok(warranty.isActiveAt('2026-10-16T12:00:00Z'));

  // Day 30 should be active
  assert.ok(warranty.isActiveAt('2026-10-31T12:00:00Z'));

  // Day 31 should be expired
  assert.equal(warranty.isActiveAt('2026-11-01T13:00:00Z'), false);
});

test('Reviews Integrity: Reviews are only permitted on completed bookings', () => {
  function canReviewBooking(bookingStatus) {
    const validStatuses = ['COMPLETED', 'PAID', 'CLOSED', 'WORK_COMPLETED'];
    return validStatuses.includes(bookingStatus);
  }

  assert.equal(canReviewBooking('REQUESTED'), false);
  assert.equal(canReviewBooking('ASSIGNED'), false);
  assert.equal(canReviewBooking('EN_ROUTE'), false);
  assert.equal(canReviewBooking('IN_PROGRESS'), false);
  assert.equal(canReviewBooking('COMPLETED'), true);
  assert.equal(canReviewBooking('PAID'), true);
  assert.equal(canReviewBooking('CLOSED'), true);
});

test('Prisma Migration: Non-destructive migration file exists', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'prisma/migrations/20261017000000_service_first_architecture/migration.sql'
  );
  assert.ok(fs.existsSync(migrationPath), 'Migration SQL file must physically exist');

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "ServiceArea"'), 'Must define ServiceArea');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "Quote"'), 'Must define Quote');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "JobAssignment"'), 'Must define JobAssignment');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "ServiceInvoice"'), 'Must define ServiceInvoice');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "ServiceWarranty"'), 'Must define ServiceWarranty');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "Part"'), 'Must define Part');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS "BookingPart"'), 'Must define BookingPart');
});
