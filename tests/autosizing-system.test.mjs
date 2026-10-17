import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Auto-Sizing Responsive System & Zero-Void Architecture', () => {
  const dashboardPath = path.resolve(process.cwd(), 'src/app/technician/dashboard/page.tsx');
  const headerPath = path.resolve(process.cwd(), 'src/components/layout/TechnicianHeader.tsx');
  const meRoutePath = path.resolve(process.cwd(), 'src/app/api/v1/technicians/me/route.ts');

  it('Technician Dashboard: Outer container uses fluid auto-sizing max-w-[1600px] layout', () => {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    assert.ok(
      content.includes('max-w-[1600px]'),
      'Technician dashboard should utilize fluid max-w-[1600px] auto-sizing container'
    );
    assert.ok(
      !content.includes('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'),
      'Technician dashboard should not be restricted by legacy rigid max-w-7xl layout'
    );
  });

  it('Technician Dashboard: 12-column grid auto-sizes sidebar (3-4 cols) and main workspace (8-9 cols)', () => {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    assert.ok(
      content.includes('grid-cols-1 lg:grid-cols-12'),
      'Dashboard layout must utilize responsive 12-column grid system'
    );
    assert.ok(
      content.includes('lg:col-span-4 xl:col-span-3'),
      'Sidebar must auto-size proportionally (4 cols on lg, 3 cols on xl)'
    );
    assert.ok(
      content.includes('lg:col-span-8 xl:col-span-9'),
      'Main workspace must auto-size proportionally (8 cols on lg, 9 cols on xl)'
    );
  });

  it('Technician Dashboard: Replaces solitary spinner with zero-void AutoSizingDashboardSkeleton', () => {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    assert.ok(
      content.includes('AutoSizingDashboardSkeleton'),
      'Dashboard must define AutoSizingDashboardSkeleton for zero layout shift'
    );
    assert.ok(
      !content.includes('<div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />\n            </div>\n          )}'),
      'Dashboard must eliminate isolated centered spinner inside massive empty void'
    );
  });

  it('Technician Dashboard: Auto-sizes KPI cards and lifecycle grid with auto-rows-fr', () => {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    assert.ok(
      content.includes('grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 auto-rows-fr'),
      'KPI cards must use responsive auto-rows-fr equal height system'
    );
    assert.ok(
      content.includes('auto-rows-fr'),
      'Dashboard elements must use auto-rows-fr for consistent card geometry'
    );
  });

  it('Technician Header: Top dispatch hotline bar and desktop header auto-size to max-w-[1600px]', () => {
    const content = fs.readFileSync(headerPath, 'utf8');
    assert.ok(
      content.includes('max-w-[1600px]'),
      'TechnicianHeader desktop containers must auto-size to max-w-[1600px]'
    );
  });

  it('Technician Profile API: Auto-initializes technician profile if record does not exist yet', () => {
    const content = fs.readFileSync(meRoutePath, 'utf8');
    assert.ok(
      content.includes('prisma.technicianProfile.create'),
      '/api/v1/technicians/me must auto-create profile for authenticated technician instead of throwing 404'
    );
  });
});
