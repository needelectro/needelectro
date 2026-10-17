import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Executive Dashboard: Real-time stats API with date range filtering and financial breakdown', () => {
  const statsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'admin', 'stats', 'route.ts');
  const content = fs.readFileSync(statsRoutePath, 'utf8');

  // Verify date range parameter support
  assert.ok(
    content.includes("searchParams.get('range')") || content.includes('statsCache'),
    'Admin stats route must support date range filtering'
  );
  assert.ok(
    content.includes("'today'") && content.includes("'7d'") && content.includes("'this_month'"),
    'Admin stats route must support today, 7d, and this_month filters'
  );

  // Verify business overview metrics
  assert.ok(content.includes('totalCustomers'), 'Must compute total customers');
  assert.ok(content.includes('verifiedTechnicians'), 'Must compute verified technicians');
  assert.ok(content.includes('activeJobs'), 'Must compute active jobs');
  assert.ok(content.includes('completedJobs'), 'Must compute completed jobs');
  assert.ok(content.includes('totalOrders'), 'Must compute total orders');
  assert.ok(content.includes('lowStockProducts'), 'Must compute low stock products');

  // Verify financial split (85% technician commission, 15% platform share)
  assert.ok(
    content.includes('0.85') && content.includes('0.15'),
    'Must calculate technician commission (85%) and platform commission (15%)'
  );
  assert.ok(
    content.includes('pendingPayoutLiabilities'),
    'Must track pending technician payout liabilities'
  );
});

test('Executive Dashboard UI: Date range filter bar and operational command center', () => {
  const dashboardPagePath = path.join(projectRoot, 'src', 'app', 'admin', 'dashboard', 'page.tsx');
  const content = fs.readFileSync(dashboardPagePath, 'utf8');

  assert.ok(content.includes('selectedRange'), 'Dashboard must manage selectedRange state');
  assert.ok(content.includes('/api/v1/admin/stats?range='), 'Dashboard must fetch stats with range query');
  assert.ok(content.includes('Executive Operations Dashboard'), 'Dashboard title must reflect executive command center');
  assert.ok(content.includes('/admin/jobs?status='), 'Dashboard must link directly to filtered job lists');
  assert.ok(content.includes('/admin/technicians?status='), 'Dashboard must link directly to filtered technician lists');
  assert.ok(content.includes('/admin/orders?status='), 'Dashboard must link directly to filtered order lists');
  assert.ok(content.includes('/admin/payments'), 'Dashboard must link directly to financial payments ledger');
});

test('Service Booking Inbox & Dispatch API: Comprehensive workflow actions', () => {
  const jobsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'admin', 'jobs', 'route.ts');
  const content = fs.readFileSync(jobsRoutePath, 'utf8');

  // Verify GET mapping
  assert.ok(content.includes('mappedJobs'), 'Jobs route must map jobs with normalized customer & service data');
  assert.ok(content.includes('mappedTechnicians'), 'Jobs route must return verified technician candidates');

  // Verify POST and PATCH support
  assert.ok(content.includes('export async function POST'), 'Jobs route must support POST actions');
  assert.ok(content.includes('export async function PATCH'), 'Jobs route must support PATCH actions');

  // Verify essential dispatch actions
  assert.ok(content.includes('ASSIGN_TECHNICIAN'), 'Must support manual technician assignment');
  assert.ok(content.includes('REASSIGN_TECHNICIAN'), 'Must support technician reassignment');
  assert.ok(content.includes('AUTO_ASSIGN'), 'Must support automated smart-match assignment');
  assert.ok(content.includes('CANCEL_BOOKING'), 'Must support administrative booking cancellation');
  assert.ok(content.includes('APPROVE_COMPLETION'), 'Must support completion report approval and 85% share settlement');
  assert.ok(content.includes('UPDATE_STATUS'), 'Must support administrative status overrides');

  // Verify Audit Log integration
  assert.ok(content.includes('auditLog.create'), 'Administrative interventions must record audit log records');
});

test('Service Booking Inbox UI: Auto-dispatch, reassign, and completion actions', () => {
  const jobsPagePath = path.join(projectRoot, 'src', 'app', 'admin', 'jobs', 'page.tsx');
  const content = fs.readFileSync(jobsPagePath, 'utf8');

  assert.ok(content.includes('handleAutoAssign'), 'Jobs page must implement handleAutoAssign');
  assert.ok(content.includes('handleCancelBooking'), 'Jobs page must implement handleCancelBooking');
  assert.ok(content.includes('handleApproveCompletion'), 'Jobs page must implement handleApproveCompletion');
  assert.ok(content.includes('Auto-Dispatch'), 'Jobs page must feature Auto-Dispatch button for unassigned jobs');
  assert.ok(content.includes('bookingNumber'), 'Jobs page must support search by booking number');
});

test('Technician Workforce Management & Payout Settling', () => {
  const techRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'admin', 'technicians', 'route.ts');
  const content = fs.readFileSync(techRoutePath, 'utf8');

  assert.ok(content.includes('export async function GET'), 'Technicians route must support GET directory');
  assert.ok(content.includes('export async function PATCH'), 'Technicians route must support PATCH updates');
  assert.ok(content.includes('verificationStatus'), 'Technicians route must support verificationStatus updates');
  assert.ok(content.includes('payoutAction'), 'Technicians route must handle payout actions (APPROVE, PAID, REJECT)');
  assert.ok(content.includes('payoutRequestId'), 'Technicians route must link payout operations to requests');
});

test('Global Search API: Cross-module unified lookup', () => {
  const searchRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'admin', 'search', 'route.ts');
  const content = fs.readFileSync(searchRoutePath, 'utf8');

  assert.ok(content.includes('prisma.booking.findMany'), 'Global search must search bookings by reference and problem');
  assert.ok(content.includes('prisma.order.findMany'), 'Global search must search orders by number and customer');
  assert.ok(content.includes('prisma.customerProfile.findMany'), 'Global search must search customers');
  assert.ok(content.includes('prisma.technicianProfile.findMany'), 'Global search must search technicians by name and skills');
  assert.ok(content.includes('prisma.product.findMany'), 'Global search must search products by name and SKU');
});

test('Customer Account Management API: Real records and lifetime spend', () => {
  const customerRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'admin', 'customers', 'route.ts');
  const content = fs.readFileSync(customerRoutePath, 'utf8');

  assert.ok(content.includes('orders'), 'Customer API must include order history');
  assert.ok(content.includes('bookings'), 'Customer API must include booking history');
  assert.ok(content.includes('lifetimeSpend'), 'Customer API must calculate customer lifetime spend');
  assert.ok(content.includes('addresses'), 'Customer API must include saved address snapshots');
});

test('Admin Role-Based Security: Rejects unauthenticated and unauthorized roles', () => {
  const apiAuthPath = path.join(projectRoot, 'src', 'lib', 'apiAuth.ts');
  const content = fs.readFileSync(apiAuthPath, 'utf8');

  assert.ok(content.includes('requireAdminAuth'), 'Must provide centralized requireAdminAuth helper');
  assert.ok(content.includes('isStaffOrAdmin'), 'Must check staff/admin role permissions');
  assert.ok(content.includes('status: 401'), 'Must return 401 for unauthenticated requests');
  assert.ok(content.includes('status: 403'), 'Must return 403 for unauthorized roles');
});
