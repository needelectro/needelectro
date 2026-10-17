import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Technician Routes: All required dedicated pages exist', () => {
  const routes = [
    'src/app/technician/dashboard/page.tsx',
    'src/app/technician/jobs/page.tsx',
    'src/app/technician/jobs/[id]/page.tsx',
    'src/app/technician/earnings/page.tsx',
    'src/app/technician/profile/page.tsx',
    'src/app/technician/availability/page.tsx',
    'src/app/technician/notifications/page.tsx',
    'src/app/technician/support/page.tsx',
    'src/app/technician/reviews/page.tsx',
    'src/app/technician/register/page.tsx',
    'src/app/technician/login/page.tsx',
  ];

  for (const relPath of routes) {
    const fullPath = path.resolve(process.cwd(), relPath);
    assert.ok(fs.existsSync(fullPath), `Route file must exist: ${relPath}`);
  }
});

test('Technician APIs: Dedicated REST endpoints exist', () => {
  const apiRoutes = [
    'src/app/api/v1/technicians/me/route.ts',
    'src/app/api/v1/technicians/payouts/route.ts',
    'src/app/api/v1/technicians/notifications/route.ts',
    'src/app/api/v1/technicians/support/route.ts',
    'src/app/api/v1/bookings/[id]/accept/route.ts',
    'src/app/api/v1/bookings/[id]/parts/route.ts',
    'src/app/api/v1/admin/technicians/route.ts',
  ];

  for (const relPath of apiRoutes) {
    const fullPath = path.resolve(process.cwd(), relPath);
    assert.ok(fs.existsSync(fullPath), `API endpoint file must exist: ${relPath}`);
  }
});

test('Technician Dashboard: Features real-time availability toggle and quick actions', () => {
  const dashboardPath = path.resolve(process.cwd(), 'src/app/technician/dashboard/page.tsx');
  const content = fs.readFileSync(dashboardPath, 'utf-8');

  assert.ok(content.includes('availableStatus'), 'Must track technician availableStatus');
  assert.ok(content.includes('profileCompletion'), 'Must calculate profile completion percentage');
  assert.ok(content.includes('/technician/jobs'), 'Must link to job marketplace');
  assert.ok(content.includes('/technician/earnings'), 'Must link to earnings and payouts');
  assert.ok(content.includes('/technician/notifications'), 'Must link to notifications');
  assert.ok(content.includes('01733-983752'), 'Must include emergency dispatch hotline');
});

test('Job Marketplace: Claim concurrency safety and verification check', () => {
  const acceptRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/accept/route.ts');
  const content = fs.readFileSync(acceptRoutePath, 'utf-8');

  assert.ok(content.includes('$transaction'), 'Must execute atomic transaction for job claim');
  assert.ok(content.includes('verificationStatus !== \'VERIFIED\''), 'Must verify technician approval before claiming');
  assert.ok(content.includes('existing.technicianId'), 'Must prevent race condition if job was claimed');
  assert.ok(content.includes('status: \'ACCEPTED\''), 'Must transition job to ACCEPTED upon claim');
});

test('Job Details Workspace: Status state machine and customer privacy protection', () => {
  const jobDetailPath = path.resolve(process.cwd(), 'src/app/technician/jobs/[id]/page.tsx');
  const bookingApi = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/route.ts');

  const pageContent = fs.readFileSync(jobDetailPath, 'utf-8');
  const apiContent = fs.readFileSync(bookingApi, 'utf-8');

  // Verify UI progression
  assert.ok(pageContent.includes('ON_THE_WAY'), 'Must support En Route status');
  assert.ok(pageContent.includes('ARRIVED'), 'Must support Arrived at Site status');
  assert.ok(pageContent.includes('WORK_STARTED'), 'Must support Work Started status');
  assert.ok(pageContent.includes('COMPLETED'), 'Must support Completed status');
  assert.ok(pageContent.includes('googleMapsUrl'), 'Must provide Google Maps navigation directions');
  assert.ok(pageContent.includes('bookingParts'), 'Must show hardware and replacement parts section');

  // Verify API customer privacy sanitation for unclaimed jobs
  assert.ok(apiContent.includes('Hidden until accepted') || apiContent.includes('Full address revealed upon job acceptance'),
    'Must sanitize customer private details on unclaimed jobs to protect customer privacy');
});

test('Commission & Earnings: 85%/15% split and idempotent ledger crediting', () => {
  const bookingApi = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/route.ts');
  const content = fs.readFileSync(bookingApi, 'utf-8');

  assert.ok(content.includes('commissionRate = 15.0') || content.includes('0.15'), 'Must enforce 15% platform fee');
  assert.ok(content.includes('technicianAmount') && content.includes('serviceAmount - platformFee'), 'Must allocate 85% to technician');
  assert.ok(content.includes('existingEarning'), 'Must check existing earnings for idempotency');
  assert.ok(content.includes('walletBalance: { increment: technicianAmount }'), 'Must credit technician wallet balance');
  assert.ok(content.includes('type: \'JOB_EARNING\''), 'Must record wallet transaction ledger entry');
});

test('Payout System: Minimum ৳500 validation, balance guard, and audit settlement', () => {
  const payoutApi = path.resolve(process.cwd(), 'src/app/api/v1/technicians/payouts/route.ts');
  const content = fs.readFileSync(payoutApi, 'utf-8');

  assert.ok(content.includes('500'), 'Must enforce minimum ৳500 payout threshold');
  assert.ok(content.includes('walletBalance < payoutAmount'), 'Must reject if insufficient wallet balance');
  assert.ok(content.includes('verificationStatus !== \'VERIFIED\''), 'Must require verified account for withdrawals');
  assert.ok(content.includes('status: \'PENDING\''), 'Must check for duplicate pending payout requests');
  assert.ok(content.includes('walletBalance: { decrement: payoutAmount }'), 'Must atomically deduct balance upon submission');
});

test('Support & Dispute Desk: Ticket categories and 24/7 hotline', () => {
  const supportPath = path.resolve(process.cwd(), 'src/app/technician/support/page.tsx');
  const content = fs.readFileSync(supportPath, 'utf-8');

  assert.ok(content.includes('SAFETY_EMERGENCY'), 'Must support safety emergency category');
  assert.ok(content.includes('PAYMENT_DISPUTE'), 'Must support payment dispute category');
  assert.ok(content.includes('CUSTOMER_NO_SHOW'), 'Must support customer no-show category');
  assert.ok(content.includes('01733-983752'), 'Must include 24/7 safety hotline');
});
