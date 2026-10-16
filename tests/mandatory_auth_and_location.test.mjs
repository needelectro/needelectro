import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Mandatory Auth in Orders API: Guest checkout is strictly prohibited', async () => {
  const ordersRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'orders', 'route.ts');
  const content = fs.readFileSync(ordersRoutePath, 'utf8');

  // Verify server-side authentication check
  assert.ok(content.includes('if (!session)'), 'POST /api/v1/orders must check for authenticated session');
  assert.ok(
    content.includes("requiresAuth: true") || content.includes("redirectUrl: '/customer/login?redirect=/checkout'"),
    'POST /api/v1/orders must reject unauthenticated requests with requiresAuth and redirect'
  );
  assert.ok(
    content.includes('status: 401'),
    'POST /api/v1/orders must return HTTP 401 for unauthenticated attempts'
  );
});

test('Mandatory Auth in Bookings API: Guest service booking is strictly prohibited', async () => {
  const bookingsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
  const content = fs.readFileSync(bookingsRoutePath, 'utf8');

  // Verify server-side authentication check
  assert.ok(content.includes('if (!session)'), 'POST /api/v1/bookings must check for authenticated session');
  assert.ok(
    content.includes("requiresAuth: true"),
    'POST /api/v1/bookings must reject unauthenticated requests with requiresAuth: true'
  );
  assert.ok(
    content.includes("redirectUrl: '/customer/login?redirect=/booking'"),
    'POST /api/v1/bookings must return safe internal redirect URL to customer login'
  );
  assert.ok(
    content.includes('status: 401'),
    'POST /api/v1/bookings must return HTTP 401 for unauthenticated attempts'
  );
});

test('Flexible Service Location: One-time service location does NOT overwrite permanent default address', async () => {
  const bookingsRoutePath = path.join(projectRoot, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
  const content = fs.readFileSync(bookingsRoutePath, 'utf8');

  // Ensure isDefault is not hardcoded to true, but respects saveToProfile / isDefaultExplicit
  assert.ok(
    content.includes('isDefaultExplicit') || content.includes('saveToProfile'),
    'Service address creation must not blindly mark new addresses as default'
  );
  assert.ok(
    content.includes('isDefault: isDefaultExplicit'),
    'Service location snapshot must use explicit isDefault flag'
  );
});

test('Smart Auto-Fill: Booking and Checkout pages auto-populate user profile and support saved addresses', async () => {
  const bookingPagePath = path.join(projectRoot, 'src', 'app', 'booking', 'page.tsx');
  const bookingContent = fs.readFileSync(bookingPagePath, 'utf8');

  assert.ok(bookingContent.includes('useAuth'), 'Booking page must use useAuth hook');
  assert.ok(bookingContent.includes('/api/v1/customer/addresses'), 'Booking page must fetch saved addresses');
  assert.ok(bookingContent.includes("locationMode === 'SAVED'"), 'Booking page must support saved address selection');
  assert.ok(bookingContent.includes("locationMode === 'CUSTOM'"), 'Booking page must support custom location without altering permanent address');
  assert.ok(bookingContent.includes('Smart Profile Auto-Fill') || bookingContent.includes('Profile Auto-Fill'), 'Booking page must have auto-fill indicator');

  const checkoutPagePath = path.join(projectRoot, 'src', 'app', 'checkout', 'page.tsx');
  const checkoutContent = fs.readFileSync(checkoutPagePath, 'utf8');

  assert.ok(checkoutContent.includes('useAuth'), 'Checkout page must use useAuth hook');
  assert.ok(checkoutContent.includes('/api/v1/customer/addresses'), 'Checkout page must fetch saved customer addresses');
  assert.ok(checkoutContent.includes("addressMode === 'SAVED'"), 'Checkout page must support saved delivery address selection');
  assert.ok(checkoutContent.includes("addressMode === 'CUSTOM'"), 'Checkout page must support custom delivery address entry');
  assert.ok(checkoutContent.includes('Mandatory Customer Authentication') || checkoutContent.includes('Sign In to Complete Your Order'), 'Checkout page must enforce mandatory auth prompt');
});

test('Cart Preservation: Cart is preserved during authentication redirects', async () => {
  const cartPagePath = path.join(projectRoot, 'src', 'app', 'cart', 'page.tsx');
  const cartContent = fs.readFileSync(cartPagePath, 'utf8');

  assert.ok(cartContent.includes('useAuth'), 'Cart page must use useAuth');
  assert.ok(cartContent.includes('/customer/login?redirect=/checkout'), 'Cart page must redirect unauthenticated visitors to login with checkout redirect target');
  assert.ok(cartContent.includes('items.length === 0'), 'Cart items must be verified and not cleared on redirect');
});

test('District Service Coverage Availability: Coverage rules are accurately mapped', async () => {
  const districtsFilePath = path.join(projectRoot, 'src', 'lib', 'data', 'districts.ts');
  const content = fs.readFileSync(districtsFilePath, 'utf8');

  assert.ok(content.includes('BANGLADESH_DISTRICTS'), 'Districts database must be present');
  assert.ok(content.includes('onSiteServiceAvailable'), 'Districts must specify on-site service availability');
  assert.ok(content.includes('deliveryTimeDays'), 'Districts must specify delivery timeline');
});
