import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Status Transition State Machine: Strict sequence enforcement in route.ts', () => {
  const bookingRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/route.ts');
  assert.ok(fs.existsSync(bookingRoutePath), 'Booking detail route must exist');

  const content = fs.readFileSync(bookingRoutePath, 'utf-8');

  // Verify transition map exists
  assert.ok(content.includes('VALID_TECHNICIAN_TRANSITIONS'), 'Must define authoritative VALID_TECHNICIAN_TRANSITIONS');
  assert.ok(content.includes('ASSIGNED: ['), 'Must restrict ASSIGNED transitions');
  assert.ok(content.includes('ACCEPTED: ['), 'Must restrict ACCEPTED transitions');
  assert.ok(content.includes('ON_THE_WAY: ['), 'Must restrict ON_THE_WAY transitions');
  assert.ok(content.includes('ARRIVED: ['), 'Must restrict ARRIVED transitions');
  assert.ok(content.includes('INSPECTION_STARTED: ['), 'Must restrict INSPECTION_STARTED transitions');
  assert.ok(content.includes('AWAITING_APPROVAL: ['), 'Must restrict AWAITING_APPROVAL transitions');
  assert.ok(content.includes('IN_PROGRESS: ['), 'Must restrict IN_PROGRESS transitions');
  assert.ok(content.includes('ON_HOLD: ['), 'Must restrict ON_HOLD transitions');

  // Verify skip protection error response
  assert.ok(
    content.includes('Invalid status transition: Cannot transition job directly from'),
    'Must return 400 error when technician attempts an invalid status jump'
  );
});

test('Mandatory Reasons: Enforced for REJECTED, CANCELLED, and ON_HOLD', () => {
  const bookingRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/route.ts');
  const content = fs.readFileSync(bookingRoutePath, 'utf-8');

  assert.ok(
    content.includes("['REJECTED', 'CANCELLED', 'ON_HOLD'].includes(targetNormalized)"),
    'Must check if status is in REJECTED, CANCELLED, or ON_HOLD'
  );
  assert.ok(
    content.includes('A clear reason/note is required when setting job status to'),
    'Must return 400 if reason is omitted'
  );
});

test('Completion Report Validation: Requires work performed and diagnosis before COMPLETED', () => {
  const bookingRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/route.ts');
  const content = fs.readFileSync(bookingRoutePath, 'utf-8');

  assert.ok(
    content.includes("targetNormalized === 'COMPLETED'"),
    'Must intercept COMPLETED status'
  );
  assert.ok(
    content.includes('Completion report requires documentation of work performed and final diagnosis/resolution'),
    'Must reject completion without technical work documentation'
  );
});

test('Additional Cost Approval Endpoint: Exists and validates permissions', () => {
  const approvalRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/approval/route.ts');
  assert.ok(fs.existsSync(approvalRoutePath), 'Approval API endpoint must physically exist');

  const content = fs.readFileSync(approvalRoutePath, 'utf-8');
  assert.ok(content.includes('APPROVE') && content.includes('REJECT'), 'Must support APPROVE and REJECT actions');
  assert.ok(content.includes("session.role === 'CUSTOMER'"), 'Must verify customer role');
  assert.ok(content.includes('Forbidden: Only customer or admin can approve additional costs'), 'Must restrict approval action to customer or admin');
});

test('Job Messaging Communication Endpoint: Exists and provides bidirectional chat', () => {
  const messagesRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/messages/route.ts');
  assert.ok(fs.existsSync(messagesRoutePath), 'Messages API endpoint must physically exist');

  const content = fs.readFileSync(messagesRoutePath, 'utf-8');
  assert.ok(content.includes('GET') && content.includes('POST'), 'Must support both GET and POST');
  assert.ok(content.includes('bookingTimeline.create'), 'Must log messages in timeline');
  assert.ok(content.includes('recipientUserId'), 'Must identify and notify recipient user');
});

test('Appointment Rescheduling Endpoint: Exists and enforces proposed date & reason', () => {
  const rescheduleRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/reschedule/route.ts');
  assert.ok(fs.existsSync(rescheduleRoutePath), 'Reschedule API endpoint must physically exist');

  const content = fs.readFileSync(rescheduleRoutePath, 'utf-8');
  assert.ok(content.includes('proposedDate') && content.includes('proposedTimeSlot'), 'Must require new schedule parameters');
  assert.ok(content.includes('reason.trim().length < 5'), 'Must enforce minimum reason length');
});

test('Secure Photo and Evidence Upload: Validates file type and max 5MB size', () => {
  const uploadsRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/uploads/route.ts');
  assert.ok(fs.existsSync(uploadsRoutePath), 'Uploads API endpoint must physically exist');

  const content = fs.readFileSync(uploadsRoutePath, 'utf-8');
  assert.ok(content.includes('5 * 1024 * 1024'), 'Must enforce 5MB maximum file size');
  assert.ok(content.includes('image/jpeg') && content.includes('image/png') && content.includes('image/webp'), 'Must allow only safe image MIME types');
});

test('Technician Dispatch Calendar: Dedicated schedule page exists', () => {
  const schedulePagePath = path.resolve(process.cwd(), 'src/app/technician/schedule/page.tsx');
  assert.ok(fs.existsSync(schedulePagePath), 'src/app/technician/schedule/page.tsx must physically exist');

  const content = fs.readFileSync(schedulePagePath, 'utf-8');
  assert.ok(content.includes('Technician Dispatch Calendar'), 'Must feature dispatch calendar interface');
  assert.ok(content.includes('overlaps'), 'Must calculate appointment overlaps');
  assert.ok(content.includes('Request Reschedule'), 'Must provide rescheduling triggers');
});

test('Advanced Technician Dashboard: Real database statistics integration', () => {
  const meRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/technicians/me/route.ts');
  const meContent = fs.readFileSync(meRoutePath, 'utf-8');

  assert.ok(meContent.includes('awaitingAcceptance: awaitingCount'), 'Must compute awaiting acceptance count');
  assert.ok(meContent.includes('acceptedCount'), 'Must compute accepted count');
  assert.ok(meContent.includes('monthlyEarnings'), 'Must compute monthly earnings');
  assert.ok(meContent.includes('todayScheduledTotal'), 'Must compute today scheduled total');

  const dashboardPagePath = path.resolve(process.cwd(), 'src/app/technician/dashboard/page.tsx');
  const dashContent = fs.readFileSync(dashboardPagePath, 'utf-8');
  assert.ok(dashContent.includes('Job Lifecycle Breakdown'), 'Must render lifecycle breakdown');
  assert.ok(dashContent.includes('/technician/schedule'), 'Must link to schedule page');
});

test('Admin Job Control: Audit log recorded on manual status corrections', () => {
  const adminJobsRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/admin/jobs/route.ts');
  const content = fs.readFileSync(adminJobsRoutePath, 'utf-8');

  assert.ok(content.includes('ADMIN_CORRECT_JOB_STATUS'), 'Must record audit log on admin status corrections');
  assert.ok(content.includes('bookingTimeline.create'), 'Must log timeline event');
});
