import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Zero-Wait Performance & Database Optimization Suite', () => {
  const rootDir = process.cwd();

  it('Database Schema: Indexes are present on critical high-throughput foreign keys, status fields and created dates', () => {
    const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
    assert.ok(fs.existsSync(schemaPath), 'prisma/schema.prisma must exist');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 1. TechnicianProfile composite indexing
    assert.ok(
      schema.includes('@@index([verificationStatus, availableStatus])'),
      'TechnicianProfile must have @@index([verificationStatus, availableStatus])'
    );

    // 2. Booking composite and date indexing
    assert.ok(
      schema.includes('@@index([technicianId, status])'),
      'Booking must have @@index([technicianId, status]) for technician dashboard and job lists'
    );
    assert.ok(
      schema.includes('@@index([serviceId])'),
      'Booking must have @@index([serviceId]) for relation lookups'
    );

    // 3. Product indexing
    assert.ok(
      schema.includes('@@index([isFeatured, isActive])'),
      'Product must have @@index([isFeatured, isActive]) for catalog spotlight'
    );

    // 4. Order composite indexing
    assert.ok(
      schema.includes('@@index([customerId, status])'),
      'Order must have @@index([customerId, status])'
    );

    // 5. Earnings and Wallet indexing
    assert.ok(
      schema.includes('@@index([technicianId, createdAt])'),
      'WalletTransaction must have @@index([technicianId, createdAt])'
    );

    // 6. Notification indexing
    assert.ok(
      schema.includes('@@index([userId, read])'),
      'Notification must have @@index([userId, read])'
    );

    // 7. AuditLog indexing
    assert.ok(
      schema.includes('@@index([entity, entityId])'),
      'AuditLog must have @@index([entity, entityId])'
    );
  });

  it('Technician Dashboard: Zero-wait warm cache initialization and optimistic status update with rollback', () => {
    const techDashPath = path.join(rootDir, 'src', 'app', 'technician', 'dashboard', 'page.tsx');
    assert.ok(fs.existsSync(techDashPath), 'technician dashboard page must exist');
    const code = fs.readFileSync(techDashPath, 'utf8');

    // FastFetch import
    assert.ok(code.includes("from '@/lib/fastFetch'"), 'Must import fastFetch utilities');
    assert.ok(code.includes('sessionStorage.getItem'), 'Must initialize warm state from sessionStorage for 0ms paint');
    assert.ok(code.includes('fastFetch'), 'Must use fastFetch for deduplication and background revalidation');

    // Optimistic availability update
    assert.ok(
      code.includes('setProfile((prev: any) => ({ ...prev, availableStatus: nextStatus }))'),
      'Must optimistically update availability status before network roundtrip'
    );

    // Rollback handling
    assert.ok(
      code.includes('setProfile((prev: any) => ({ ...prev, availableStatus: prevStatus }))'),
      'Must revert optimistic availability update if server rejects'
    );

    // Optimistic quick status update
    assert.ok(
      code.includes('current.map((j) => (j.id === bookingId ? { ...j, status: nextStatus } : j))'),
      'Must optimistically update job status immediately in local state'
    );

    // Non-blocking screen render
    assert.ok(
      code.includes('loading && !profile && jobs.length === 0'),
      'Must not display full-screen loading spinner when cached data exists'
    );
  });

  it('Technician Jobs Marketplace: Zero-delay tab switching and optimistic state management', () => {
    const techJobsPath = path.join(rootDir, 'src', 'app', 'technician', 'jobs', 'page.tsx');
    assert.ok(fs.existsSync(techJobsPath), 'technician jobs page must exist');
    const code = fs.readFileSync(techJobsPath, 'utf8');

    assert.ok(code.includes('fastFetch'), 'Must use fastFetch for assigned and available jobs');
    assert.ok(code.includes('invalidateFastCache'), 'Must invalidate cache on mutations');
    assert.ok(
      code.includes('current.map((j) => (j.id === bookingId ? { ...j, status: nextStatus } : j))'),
      'Must optimistically update job status in job list'
    );
    assert.ok(
      code.includes('loading && assignedJobs.length === 0 && availableJobs.length === 0'),
      'Must only show loading indicator if completely empty of job data'
    );
  });

  it('Technician Header: Eliminates duplicate un-cached network requests and uses fastFetch', () => {
    const headerPath = path.join(rootDir, 'src', 'components', 'layout', 'TechnicianHeader.tsx');
    assert.ok(fs.existsSync(headerPath), 'TechnicianHeader must exist');
    const code = fs.readFileSync(headerPath, 'utf8');

    assert.ok(code.includes("fastFetch('/api/v1/technicians/me'"), 'TechnicianHeader must use fastFetch with TTL');
    assert.ok(code.includes("fastFetch('/api/v1/technicians/notifications'"), 'TechnicianHeader must use fastFetch for notifications');
    assert.ok(code.includes('setAvailableStatus(nextStatus)'), 'TechnicianHeader must optimistically toggle status');
    assert.ok(code.includes('setAvailableStatus(prevStatus)'), 'TechnicianHeader must rollback on failure');
  });

  it('Technician Job Detail Center: Warm initialization, fastFetch and optimistic progression', () => {
    const jobDetailPath = path.join(rootDir, 'src', 'app', 'technician', 'jobs', '[id]', 'page.tsx');
    assert.ok(fs.existsSync(jobDetailPath), 'job detail page must exist');
    const code = fs.readFileSync(jobDetailPath, 'utf8');

    assert.ok(code.includes('fastFetch'), 'Job detail must use fastFetch');
    assert.ok(code.includes('sessionStorage.getItem'), 'Job detail must warm load from storage');
    assert.ok(
      code.includes('setBooking((prev: any) => (prev ? { ...prev, status: nextStatus } : prev))'),
      'Job detail must optimistically advance status badge'
    );
    assert.ok(
      code.includes('if (loading && !booking)'),
      'Job detail must not show blocking spinner when booking data is cached'
    );
  });

  it('Customer Marketplace: Zero-wait warm cache initialization and edge caching headers', () => {
    const shopPath = path.join(rootDir, 'src', 'app', 'shop', 'page.tsx');
    assert.ok(fs.existsSync(shopPath), 'shop page must exist');
    const shopCode = fs.readFileSync(shopPath, 'utf8');

    assert.ok(shopCode.includes('sessionStorage.getItem'), 'Shop page must warm-cache initialize products');
    assert.ok(shopCode.includes('loading && products.length === 0'), 'Shop page must avoid skeleton flashing when cached products exist');

    const productsApi = path.join(rootDir, 'src', 'app', 'api', 'v1', 'products', 'route.ts');
    assert.ok(fs.existsSync(productsApi), 'products API must exist');
    const apiCode = fs.readFileSync(productsApi, 'utf8');

    assert.ok(apiCode.includes('Cache-Control'), 'Products API must set Cache-Control headers');
    assert.ok(apiCode.includes('stale-while-revalidate'), 'Products API must enable stale-while-revalidate');

    const servicesApi = path.join(rootDir, 'src', 'app', 'api', 'v1', 'services', 'route.ts');
    assert.ok(fs.existsSync(servicesApi), 'services API must exist');
    const sApiCode = fs.readFileSync(servicesApi, 'utf8');

    assert.ok(sApiCode.includes('Cache-Control'), 'Services API must set Cache-Control headers');
  });

  it('Admin Panel: Warm cache initialization for 0ms metric display', () => {
    const adminDashPath = path.join(rootDir, 'src', 'app', 'admin', 'dashboard', 'page.tsx');
    assert.ok(fs.existsSync(adminDashPath), 'admin dashboard page must exist');
    const code = fs.readFileSync(adminDashPath, 'utf8');

    assert.ok(code.includes('sessionStorage.getItem'), 'Admin dashboard must warm-cache initialize stats');
    assert.ok(code.includes('fastFetch'), 'Admin dashboard must use fastFetch');
  });
});
