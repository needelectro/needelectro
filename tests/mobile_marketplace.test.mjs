import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Mobile Navigation: Must have the 5 primary marketplace destinations with correct routes', () => {
  const mobileNavPath = path.resolve(process.cwd(), 'src/components/layout/MobileNav.tsx');
  assert.ok(fs.existsSync(mobileNavPath), 'MobileNav.tsx must exist');

  const content = fs.readFileSync(mobileNavPath, 'utf-8');

  // Verify the 5 primary destinations exist in customerNavItems
  assert.ok(content.includes("'Home'"), 'MobileNav must have Home destination');
  assert.ok(content.includes("'Categories'"), 'MobileNav must have Categories destination');
  assert.ok(content.includes("'Search'"), 'MobileNav must have Search destination');
  assert.ok(content.includes("'Orders'"), 'MobileNav must have Orders destination');
  assert.ok(content.includes("'Account'") || content.includes("'Sign In'"), 'MobileNav must have Account/Sign In destination');

  // Verify paths
  assert.ok(content.includes("href: '/'"), 'Home must link to /');
  assert.ok(content.includes("href: '/categories'"), 'Categories must link to /categories');
  assert.ok(content.includes("href: '/search'"), 'Search must link to /search');
  assert.ok(content.includes("href: '/orders'"), 'Orders must link to /orders');
  assert.ok(content.includes('/customer/dashboard'), 'Account must link to customer dashboard');
});

test('Mobile Navigation: Respects mobile safe-area insets and accessibility standards', () => {
  const mobileNavPath = path.resolve(process.cwd(), 'src/components/layout/MobileNav.tsx');
  const content = fs.readFileSync(mobileNavPath, 'utf-8');

  // Safe area inset rule
  assert.ok(content.includes('safe-area-inset-bottom'), 'MobileNav must include env(safe-area-inset-bottom) for iPhone/modern mobile screens');
  
  // Accessibility check
  assert.ok(content.includes('aria-label'), 'MobileNav must provide accessible landmark aria-label');
  assert.ok(content.includes('fixed bottom-0'), 'MobileNav must be persistent at screen bottom');
});

test('Categories Directory: Page exists and provides hierarchical product & service discovery', () => {
  const categoriesPath = path.resolve(process.cwd(), 'src/app/categories/page.tsx');
  assert.ok(fs.existsSync(categoriesPath), 'categories/page.tsx must exist');

  const content = fs.readFileSync(categoriesPath, 'utf-8');
  assert.ok(content.includes('Laptops & Computers'), 'Categories page must include Laptops & Computers');
  assert.ok(content.includes('CCTV & Surveillance'), 'Categories page must include CCTV & Surveillance');
  assert.ok(content.includes('Networking & Connectivity'), 'Categories page must include Networking');
  assert.ok(content.includes('Electrical & Smart Devices'), 'Categories page must include Electrical');
  assert.ok(content.includes('Complete House & Building Wiring'), 'Categories page must include Professional Services');
});

test('Orders Tracking & History: Orders page and public tracking API route exist', () => {
  const ordersPagePath = path.resolve(process.cwd(), 'src/app/orders/page.tsx');
  const trackApiPath = path.resolve(process.cwd(), 'src/app/api/v1/orders/track/route.ts');

  assert.ok(fs.existsSync(ordersPagePath), 'orders/page.tsx must exist');
  assert.ok(fs.existsSync(trackApiPath), 'api/v1/orders/track/route.ts must exist');

  const pageContent = fs.readFileSync(ordersPagePath, 'utf-8');
  assert.ok(pageContent.includes('Instant Order Lookup'), 'Orders page must support instant guest lookup');
  assert.ok(pageContent.includes('/api/v1/orders/track'), 'Orders page must connect to tracking endpoint');
  assert.ok(pageContent.includes('Your Order History'), 'Orders page must support authenticated user order history');

  const apiContent = fs.readFileSync(trackApiPath, 'utf-8');
  assert.ok(!apiContent.includes('passwordHash'), 'Tracking API must NEVER expose user passwords');
  assert.ok(apiContent.includes('orderNumber'), 'Tracking API must validate orderNumber');
});

test('Mobile Product Details: Swipeable gallery, stock validation and persistent bottom purchase bar', () => {
  const clientDetailPath = path.resolve(process.cwd(), 'src/app/product/[slug]/ProductDetailClient.tsx');
  assert.ok(fs.existsSync(clientDetailPath), 'ProductDetailClient.tsx must exist');

  const content = fs.readFileSync(clientDetailPath, 'utf-8');

  // Touch Swipe for mobile gallery
  assert.ok(content.includes('onTouchStart') && content.includes('onTouchEnd'), 'Product gallery must support mobile touch swipe');

  // Persistent Mobile Purchase Bar
  assert.ok(content.includes('aria-label="Mobile Purchase Bar"'), 'Mobile purchase bar must be present');
  assert.ok(content.includes('fixed bottom-0'), 'Mobile purchase bar must be fixed to screen bottom');
  assert.ok(content.includes('env(safe-area-inset-bottom'), 'Mobile purchase bar must respect safe-area insets');

  // Stock protection
  assert.ok(content.includes('isOutOfStock'), 'Purchase actions must disable when product is out of stock');
});

test('Product Card: Responsive 2-column mobile layout, genuine discount and wishlist toggle', () => {
  const cardPath = path.resolve(process.cwd(), 'src/components/common/ProductCard.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(content.includes('aspect-square'), 'ProductCard must maintain consistent aspect-square image container');
  assert.ok(content.includes('isWishlisted'), 'ProductCard must support wishlist state');
  assert.ok(content.includes('discountPercent'), 'ProductCard must calculate genuine discount percentage');
  assert.ok(content.includes('isOutOfStock'), 'ProductCard must prevent adding out-of-stock items');
  assert.ok(content.includes('en-BD'), 'ProductCard must format currency according to Bangladesh locale');
});

test('Integrity: No outdated references to MR Plaza or Shop No. 5 in active source or configuration', () => {
  const filesToCheck = [
    'README.md',
    'src/lib/config/business.ts',
    'src/components/layout/Footer.tsx',
    'src/app/contact/page.tsx',
    'prisma/seed.mjs',
    'prisma/seed_phases.mjs',
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const text = fs.readFileSync(fullPath, 'utf-8');
      assert.ok(
        !text.includes('MR Plaza') && !text.includes('Shop #5') && !text.includes('Shop No. 5'),
        `File ${relPath} must not contain outdated MR Plaza or Shop No. 5 references`
      );
    }
  }
});
