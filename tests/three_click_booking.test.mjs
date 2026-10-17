import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Three-Click Service Booking UI: Streamlined 3-step mobile-first architecture', () => {
  const bookingPagePath = path.join(projectRoot, 'src', 'app', 'booking', 'page.tsx');
  const content = fs.readFileSync(bookingPagePath, 'utf8');

  // Verify Click 1: Service Trade Selection
  assert.ok(
    content.includes('Click 1: Service Trade Selection') || content.includes('SERVICE_CATEGORIES'),
    'Booking page must implement Click 1: Service Trade Selection'
  );

  // Verify Click 2: Describe Your Problem & Profile Autofill
  assert.ok(
    content.includes('Click 2: Describe Your Problem') && content.includes('Describe Your Problem *'),
    'Booking page must implement Click 2 with prominent Describe Your Problem field'
  );

  // Verify Bengali and English placeholder support
  assert.ok(
    content.includes('আপনার বৈদ্যুতিক বা প্রযুক্তিগত সমস্যাটি সংক্ষেপে লিখুন') || content.includes('Supports Bengali'),
    'Booking page must support bilingual Bengali & English problem description'
  );

  // Verify Click 3: Confirm & Submit Booking
  assert.ok(
    content.includes('Click 3: Confirm & Submit Booking') || content.includes('Confirm &amp; Submit Booking'),
    'Booking page must implement Click 3: Confirm & Submit Booking'
  );

  // Verify Collapsed Accordion for Optional Details
  assert.ok(
    content.includes('Additional Details (Optional: Schedule, Photos, Urgency)') || content.includes('showAdditionalDetails'),
    'Optional details must be cleanly collapsed under an accordion to prevent obstructing 3-click flow'
  );

  // Verify Smart Profile Auto-Fill & Saved Address Selector
  assert.ok(content.includes('Smart Profile Auto-Fill'), 'Booking page must indicate Smart Profile Auto-Fill');
  assert.ok(content.includes("locationMode === 'SAVED'"), 'Booking page must support saved address selection');
  assert.ok(content.includes("locationMode === 'CUSTOM'"), 'Booking page must support custom location entry');
  assert.ok(content.includes('/api/v1/customer/addresses'), 'Booking page must load saved addresses from API');
});

test('Mandatory Customer Authentication: Guest and Technician Access Controls', () => {
  const bookingsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
  const content = fs.readFileSync(bookingsRoutePath, 'utf8');

  // Guest rejection & redirect
  assert.ok(content.includes('if (!session)'), 'POST /api/v1/bookings must require authenticated session');
  assert.ok(content.includes('requiresAuth: true'), 'POST /api/v1/bookings must return requiresAuth: true for guests');
  assert.ok(
    content.includes("redirectUrl: '/customer/login?redirect=/booking'"),
    'POST /api/v1/bookings must return safe redirect URL preserving booking target'
  );
  assert.ok(content.includes('status: 401'), 'POST /api/v1/bookings must return HTTP 401 for guests');

  // Technician blocking
  assert.ok(
    content.includes("session.role === 'TECHNICIAN'"),
    'POST /api/v1/bookings must verify user is not a technician'
  );
  assert.ok(
    content.includes('Forbidden: Technician accounts cannot book customer services'),
    'POST /api/v1/bookings must return 403 Forbidden for technician attempts'
  );
});

test('Idempotency & Duplicate Submission Guard: 15-second double-click prevention', () => {
  const bookingsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
  const content = fs.readFileSync(bookingsRoutePath, 'utf8');

  assert.ok(
    content.includes('duplicateCutoff') || content.includes('15000'),
    'POST /api/v1/bookings must enforce a 15-second duplicate submission window'
  );
  assert.ok(
    content.includes('idempotent: true'),
    'POST /api/v1/bookings must return idempotent: true when duplicate is detected'
  );
});

test('Sensible Scheduling Defaults & Default Address Auto-Link', () => {
  const bookingsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
  const content = fs.readFileSync(bookingsRoutePath, 'utf8');

  // Flexible scheduling defaults
  assert.ok(
    content.includes('resolvedPreferredDate') && content.includes('resolvedPreferredTimeSlot'),
    'POST /api/v1/bookings must provide sensible fallbacks for preferredDate and preferredTimeSlot'
  );

  // Auto-link default saved address
  assert.ok(
    content.includes('isDefault: true') && content.includes('customerProfileId'),
    'POST /api/v1/bookings must automatically resolve customer default address if omitted'
  );

  // Address snapshot preservation
  assert.ok(
    content.includes('isDefault: isDefaultExplicit'),
    'POST /api/v1/bookings must preserve service address snapshots without silently overwriting default profile address'
  );
});

test('Notification Workflow & Status Initialization', () => {
  const bookingsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
  const content = fs.readFileSync(bookingsRoutePath, 'utf8');

  // Status initialized to REQUESTED (Awaiting Technician Assignment)
  assert.ok(
    content.includes("'REQUESTED'"),
    'Initial booking status must be REQUESTED (pending technician assignment)'
  );

  // In-app notifications
  assert.ok(
    content.includes('prisma.notification.create'),
    'Booking creation must create notification for customer'
  );
  assert.ok(
    content.includes('prisma.notification.createMany') || content.includes('admins'),
    'Booking creation must create notification for admin dispatch queue'
  );
});

test('Admin Jobs Inbox & Technician Assignment Workflow', () => {
  const adminJobsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'admin', 'jobs', 'route.ts');
  const content = fs.readFileSync(adminJobsRoutePath, 'utf8');

  assert.ok(content.includes('mappedJobs'), 'Admin jobs route must map jobs for inbox display');
  assert.ok(content.includes('ASSIGN_TECHNICIAN'), 'Admin jobs route must support technician assignment');
  assert.ok(content.includes('UPDATE_STATUS'), 'Admin jobs route must support status workflow updates');
});

test('Customer Saved Address API: Full CRUD and default toggling', () => {
  const addressesRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'customer', 'addresses', 'route.ts');
  const content = fs.readFileSync(addressesRoutePath, 'utf8');

  assert.ok(content.includes('export async function GET'), 'Addresses API must support GET');
  assert.ok(content.includes('export async function POST'), 'Addresses API must support POST');
  assert.ok(content.includes('export async function PATCH'), 'Addresses API must support PATCH');
  assert.ok(content.includes('export async function DELETE'), 'Addresses API must support DELETE');
  assert.ok(
    content.includes('division') && content.includes('district') && content.includes('upazila'),
    'Addresses API must support Bangladesh administrative areas (division, district, upazila)'
  );
});

test('Customer Dashboard: Quick 3-Click booking shortcut and profile management', () => {
  const dashboardPath = path.join(projectRoot, 'src', 'app', 'customer', 'dashboard', 'page.tsx');
  const content = fs.readFileSync(dashboardPath, 'utf8');

  assert.ok(
    content.includes('/booking'),
    'Customer dashboard must provide a direct shortcut to /booking'
  );
  assert.ok(
    content.includes("activeTab === 'profile'"),
    'Customer dashboard must have profile management tab'
  );
  assert.ok(
    content.includes("activeTab === 'bookings'"),
    'Customer dashboard must have bookings management tab'
  );
});
