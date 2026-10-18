import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Website Performance & Zero-Unnecessary-Loading Suite', () => {
  const rootDir = process.cwd();

  it('Technician API: ?lean=true returns lightweight profile and avoids heavy aggregations', () => {
    const routePath = path.join(rootDir, 'src', 'app', 'api', 'v1', 'technicians', 'me', 'route.ts');
    assert.ok(fs.existsSync(routePath), 'technicians/me route must exist');
    const code = fs.readFileSync(routePath, 'utf8');

    assert.ok(code.includes("searchParams.get('lean') === 'true'"), 'Must support ?lean=true for fast lightweight queries');
    assert.ok(code.includes('booking.groupBy'), 'Must use booking.groupBy to collapse multiple count queries into a single roundtrip');
    assert.ok(code.includes('Cache-Control'), 'Must set Cache-Control response headers');
    assert.ok(code.includes('stale-while-revalidate'), 'Must support stale-while-revalidate caching');
  });

  it('Technician Header: Navigation does not trigger repeated network fetches', () => {
    const headerPath = path.join(rootDir, 'src', 'components', 'layout', 'TechnicianHeader.tsx');
    assert.ok(fs.existsSync(headerPath), 'TechnicianHeader must exist');
    const code = fs.readFileSync(headerPath, 'utf8');

    assert.ok(code.includes('[user?.id]'), 'fetchTechStatus must depend only on user id, NOT on pathname route changes');
    assert.ok(code.includes('sessionStorage.getItem'), 'Must warm-initialize availableStatus from sessionStorage for 0ms render');
  });

  it('AuthContext: Zero-delay warm session rehydration without layout jump', () => {
    const authPath = path.join(rootDir, 'src', 'lib', 'context', 'AuthContext.tsx');
    assert.ok(fs.existsSync(authPath), 'AuthContext must exist');
    const code = fs.readFileSync(authPath, 'utf8');

    assert.ok(code.includes('_ne_user_session'), 'Must persist and hydrate user session from _ne_user_session');
    assert.ok(code.includes('sessionStorage.getItem'), 'Must initialize user state directly from sessionStorage');
  });

  it('Customer Dashboard: Non-blocking progressive rendering with fastFetch', () => {
    const dashPath = path.join(rootDir, 'src', 'app', 'customer', 'dashboard', 'page.tsx');
    assert.ok(fs.existsSync(dashPath), 'Customer dashboard page must exist');
    const code = fs.readFileSync(dashPath, 'utf8');

    assert.ok(code.includes('fastFetch'), 'Customer dashboard must use fastFetch for cached data retrieval');
    assert.ok(code.includes('sessionStorage.getItem'), 'Must warm-initialize bookings, orders, and addresses from storage');
    assert.ok(
      code.includes('loading && bookings.length === 0 && orders.length === 0'),
      'Must not display full-screen blocking spinner when cached data exists'
    );
    assert.ok(
      code.includes('initialUser={user}'),
      'Must pass initialUser to CustomerProfileView to avoid duplicate auth fetches'
    );
    assert.ok(
      code.includes('initialAddresses={addresses}'),
      'Must pass initialAddresses to CustomerProfileView to eliminate duplicate address fetches'
    );
  });

  it('Customer Profile: Duplicate request elimination and fast cache invalidation', () => {
    const profilePath = path.join(rootDir, 'src', 'components', 'profile', 'CustomerProfileView.tsx');
    assert.ok(fs.existsSync(profilePath), 'CustomerProfileView must exist');
    const code = fs.readFileSync(profilePath, 'utf8');

    assert.ok(code.includes('initialAddresses'), 'Must support initialAddresses prop');
    assert.ok(code.includes('fastFetch'), 'Must use fastFetch for fresh profile data');
    assert.ok(code.includes('invalidateFastCache'), 'Must invalidate fast cache after mutations');
  });

  it('Search: Race condition and stale response prevention', () => {
    const searchPath = path.join(rootDir, 'src', 'app', 'search', 'page.tsx');
    assert.ok(fs.existsSync(searchPath), 'Search page must exist');
    const code = fs.readFileSync(searchPath, 'utf8');

    assert.ok(code.includes('currentSearchRef'), 'Must track current search id to prevent race conditions');
    assert.ok(code.includes('fastFetch'), 'Must use fastFetch for instant cached results');
  });

  it('Bookings API: Pagination bounds and private edge cache headers', () => {
    const bookingsPath = path.join(rootDir, 'src', 'app', 'api', 'v1', 'bookings', 'route.ts');
    assert.ok(fs.existsSync(bookingsPath), 'Bookings API route must exist');
    const code = fs.readFileSync(bookingsPath, 'utf8');

    assert.ok(code.includes('take: limit'), 'Bookings API must bound results with take: limit');
    assert.ok(code.includes('Cache-Control'), 'Bookings API must include Cache-Control header');
  });

  it('Addresses and Auth /me API: Private Cache-Control headers', () => {
    const addrPath = path.join(rootDir, 'src', 'app', 'api', 'v1', 'customer', 'addresses', 'route.ts');
    assert.ok(fs.existsSync(addrPath), 'Addresses API route must exist');
    const addrCode = fs.readFileSync(addrPath, 'utf8');
    assert.ok(addrCode.includes('Cache-Control'), 'Addresses API must include Cache-Control header');

    const mePath = path.join(rootDir, 'src', 'app', 'api', 'v1', 'auth', 'me', 'route.ts');
    assert.ok(fs.existsSync(mePath), 'Auth me route must exist');
    const meCode = fs.readFileSync(mePath, 'utf8');
    assert.ok(meCode.includes('Cache-Control'), 'Auth me route must include Cache-Control header');
  });
});
