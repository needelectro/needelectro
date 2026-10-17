import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Middleware: Route boundary rules enforce strict portal separation', () => {
  const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');
  assert.ok(fs.existsSync(middlewarePath), 'src/middleware.ts must exist');

  const content = fs.readFileSync(middlewarePath, 'utf-8');

  // Verify Technician redirection from customer pages
  assert.ok(content.includes('isTechnician'), 'Must detect active technician session');
  assert.ok(content.includes('/technician/dashboard'), 'Must redirect technicians to /technician/dashboard');
  assert.ok(content.includes('isCustomerOnlyPage'), 'Must identify customer-only routes');
  assert.ok(content.includes('/cart') && content.includes('/checkout') && content.includes('/orders'),
    'Must classify cart, checkout and orders as customer-only pages');

  // Verify Customer redirection from technician portal
  assert.ok(content.includes('/customer/dashboard'), 'Must redirect customers to /customer/dashboard');
  assert.ok(content.includes('isCustomer') && content.includes('/technician'),
    'Must redirect customers attempting to access technician portal');

  // Verify API route level protection
  assert.ok(content.includes('/api/v1/technicians'), 'Must protect technician APIs');
  assert.ok(content.includes('/api/v1/orders'), 'Must protect customer order APIs from technician tampering');
  assert.ok(content.includes('/api/v1/customer'), 'Must protect customer profile APIs');
});

test('Server API Protection: Customer Orders API strictly forbids technician accounts', () => {
  const ordersApiPath = path.resolve(process.cwd(), 'src/app/api/v1/orders/route.ts');
  assert.ok(fs.existsSync(ordersApiPath), 'src/app/api/v1/orders/route.ts must exist');

  const content = fs.readFileSync(ordersApiPath, 'utf-8');
  assert.ok(content.includes("session.role === 'TECHNICIAN'"), 'Must check for TECHNICIAN role in orders API');
  assert.ok(content.includes('403'), 'Must return 403 Forbidden for technician in orders API');
  assert.ok(content.includes('Forbidden: Technician accounts cannot view customer order history'),
    'Must block technicians from reading customer order history');
  assert.ok(content.includes('Forbidden: Technician accounts cannot place customer product orders'),
    'Must block technicians from submitting customer product orders');
});

test('Server API Protection: Customer Delivery Addresses API strictly forbids technician accounts', () => {
  const addressesApiPath = path.resolve(process.cwd(), 'src/app/api/v1/customer/addresses/route.ts');
  assert.ok(fs.existsSync(addressesApiPath), 'src/app/api/v1/customer/addresses/route.ts must exist');

  const content = fs.readFileSync(addressesApiPath, 'utf-8');
  assert.ok(content.includes("payload.role === 'TECHNICIAN'"), 'Must check for TECHNICIAN role in addresses API');
  assert.ok(content.includes('Forbidden: Technician accounts cannot manage customer delivery addresses'),
    'Must return 403 Forbidden when technician attempts to manage delivery addresses');
});

test('Server API Protection: Customer Bookings API strictly forbids technician account service booking', () => {
  const bookingsApiPath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/route.ts');
  assert.ok(fs.existsSync(bookingsApiPath), 'src/app/api/v1/bookings/route.ts must exist');

  const content = fs.readFileSync(bookingsApiPath, 'utf-8');
  assert.ok(content.includes("session.role === 'TECHNICIAN'"), 'Must check for TECHNICIAN role in booking creation');
  assert.ok(content.includes('Forbidden: Technician accounts cannot book customer services'),
    'Must reject technician role from creating customer service bookings with 403 Forbidden');
});

test('Server API Protection: Technician APIs strictly forbid customer role', () => {
  const payoutsApiPath = path.resolve(process.cwd(), 'src/app/api/v1/technicians/payouts/route.ts');
  const meApiPath = path.resolve(process.cwd(), 'src/app/api/v1/technicians/me/route.ts');
  const acceptApiPath = path.resolve(process.cwd(), 'src/app/api/v1/bookings/[id]/accept/route.ts');

  const payoutsContent = fs.readFileSync(payoutsApiPath, 'utf-8');
  const meContent = fs.readFileSync(meApiPath, 'utf-8');
  const acceptContent = fs.readFileSync(acceptApiPath, 'utf-8');

  assert.ok(payoutsContent.includes("payload.role !== 'TECHNICIAN'"), 'Payouts API must only allow TECHNICIAN');
  assert.ok(meContent.includes("payload.role !== 'TECHNICIAN'"), 'Technician /me API must guard against non-technicians');
  assert.ok(acceptContent.includes("session.role !== 'TECHNICIAN'"), 'Job accept API must only allow TECHNICIAN');
});

test('Navigation & Layout: Header hides Cart and adapts navigation for Technician role', () => {
  const headerPath = path.resolve(process.cwd(), 'src/components/layout/Header.tsx');
  const content = fs.readFileSync(headerPath, 'utf-8');

  assert.ok(content.includes("user?.role !== 'TECHNICIAN'"), 'Must conditionally hide Cart icon for technicians');
  assert.ok(content.includes("user?.role === 'TECHNICIAN'") || content.includes("user.role === 'TECHNICIAN'"), 'Must render technician-specific links in drawer and menu');
  assert.ok(content.includes("user.role === 'CUSTOMER'") || content.includes("user?.role === 'CUSTOMER'"), 'Must render customer-specific links in drawer and menu');
});

test('Navigation & Layout: MobileNav separates Technician and Customer destinations', () => {
  const mobileNavPath = path.resolve(process.cwd(), 'src/components/layout/MobileNav.tsx');
  const content = fs.readFileSync(mobileNavPath, 'utf-8');

  assert.ok(content.includes('technicianNavItems'), 'Must define technicianNavItems');
  assert.ok(content.includes('customerNavItems'), 'Must define customerNavItems');
  assert.ok(content.includes('isTechnician ? technicianNavItems : customerNavItems'),
    'Must switch mobile navigation items based on technician role');
});

test('Login & Session Handling: Prevents open redirects and cross-portal redirection', () => {
  const loginApiPath = path.resolve(process.cwd(), 'src/app/api/v1/auth/login/route.ts');
  const content = fs.readFileSync(loginApiPath, 'utf-8');

  assert.ok(content.includes('safeRedirect'), 'Must determine safeRedirect');
  assert.ok(content.includes("user.role === 'TECHNICIAN'") && content.includes('/technician/dashboard'),
    'Must default technician login redirect to /technician/dashboard');
  assert.ok(content.includes("user.role === 'ADMIN'") && content.includes('/admin/dashboard'),
    'Must default admin login redirect to /admin/dashboard');
  assert.ok(content.includes("!requestedRedirect.includes('//')"),
    'Must prevent open redirects containing double slashes');
});

test('Client Protection: Cart, Checkout and Orders pages redirect technicians on load', () => {
  const cartPath = path.resolve(process.cwd(), 'src/app/cart/page.tsx');
  const checkoutPath = path.resolve(process.cwd(), 'src/app/checkout/page.tsx');
  const ordersPath = path.resolve(process.cwd(), 'src/app/orders/page.tsx');
  const customerDashPath = path.resolve(process.cwd(), 'src/app/customer/dashboard/page.tsx');

  const cartContent = fs.readFileSync(cartPath, 'utf-8');
  const checkoutContent = fs.readFileSync(checkoutPath, 'utf-8');
  const ordersContent = fs.readFileSync(ordersPath, 'utf-8');
  const dashContent = fs.readFileSync(customerDashPath, 'utf-8');

  assert.ok(cartContent.includes("user?.role === 'TECHNICIAN'") && cartContent.includes('/technician/dashboard'),
    'Cart page must redirect technicians');
  assert.ok(checkoutContent.includes("user?.role === 'TECHNICIAN'") && checkoutContent.includes('/technician/dashboard'),
    'Checkout page must redirect technicians');
  assert.ok(ordersContent.includes("user?.role === 'TECHNICIAN'") && ordersContent.includes('/technician/dashboard'),
    'Orders page must redirect technicians');
  assert.ok(dashContent.includes("user.role === 'TECHNICIAN'") && dashContent.includes('/technician/dashboard'),
    'Customer dashboard must redirect technicians');
});
