import { UserSession } from '@/types';

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'SALES_MANAGER'
  | 'ACCOUNTANT'
  | 'SERVICE_MANAGER'
  | 'TECHNICIAN_MANAGER'
  | 'SUPPORT_AGENT'
  | 'CONTENT_MANAGER';

export type AdminPermission =
  | 'dashboard:view'
  | 'products:read'
  | 'products:write'
  | 'inventory:read'
  | 'inventory:adjust'
  | 'orders:read'
  | 'orders:write'
  | 'orders:refund'
  | 'customers:read'
  | 'customers:write'
  | 'finance:read'
  | 'finance:payout'
  | 'finance:emi'
  | 'services:read'
  | 'services:write'
  | 'technicians:read'
  | 'technicians:verify'
  | 'technicians:assign'
  | 'jobs:read'
  | 'jobs:manage'
  | 'leads:read'
  | 'leads:write'
  | 'reviews:read'
  | 'reviews:moderate'
  | 'cms:read'
  | 'cms:write'
  | 'notifications:read'
  | 'notifications:send'
  | 'support:read'
  | 'support:reply'
  | 'reports:view'
  | 'reports:export'
  | 'staff:manage'
  | 'settings:write'
  | 'audit:read';

export type OperationalRole = AdminRole;

export const STAFF_ROLES: AdminRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATIONS_MANAGER',
  'INVENTORY_MANAGER',
  'SALES_MANAGER',
  'ACCOUNTANT',
  'SERVICE_MANAGER',
  'TECHNICIAN_MANAGER',
  'SUPPORT_AGENT',
  'CONTENT_MANAGER',
];

export const ROLE_PERMISSIONS: Record<string, AdminPermission[]> = {
  SUPER_ADMIN: [
    'dashboard:view',
    'products:read', 'products:write',
    'inventory:read', 'inventory:adjust',
    'orders:read', 'orders:write', 'orders:refund',
    'customers:read', 'customers:write',
    'finance:read', 'finance:payout', 'finance:emi',
    'services:read', 'services:write',
    'technicians:read', 'technicians:verify', 'technicians:assign',
    'jobs:read', 'jobs:manage',
    'leads:read', 'leads:write',
    'reviews:read', 'reviews:moderate',
    'cms:read', 'cms:write',
    'notifications:read', 'notifications:send',
    'support:read', 'support:reply',
    'reports:view', 'reports:export',
    'staff:manage',
    'settings:write',
    'audit:read',
  ],
  ADMIN: [
    'dashboard:view',
    'products:read', 'products:write',
    'inventory:read', 'inventory:adjust',
    'orders:read', 'orders:write', 'orders:refund',
    'customers:read', 'customers:write',
    'finance:read', 'finance:emi',
    'services:read', 'services:write',
    'technicians:read', 'technicians:verify', 'technicians:assign',
    'jobs:read', 'jobs:manage',
    'leads:read', 'leads:write',
    'reviews:read', 'reviews:moderate',
    'cms:read', 'cms:write',
    'notifications:read', 'notifications:send',
    'support:read', 'support:reply',
    'reports:view', 'reports:export',
    'settings:write',
    'audit:read',
  ],
  OPERATIONS_MANAGER: [
    'dashboard:view',
    'orders:read', 'orders:write',
    'inventory:read',
    'jobs:read', 'jobs:manage',
    'technicians:read', 'technicians:assign',
    'customers:read',
    'support:read',
    'reports:view',
  ],
  INVENTORY_MANAGER: [
    'dashboard:view',
    'products:read', 'products:write',
    'inventory:read', 'inventory:adjust',
    'reports:view',
  ],
  SALES_MANAGER: [
    'dashboard:view',
    'orders:read', 'orders:write',
    'leads:read', 'leads:write',
    'customers:read',
    'finance:emi',
    'reports:view',
  ],
  ACCOUNTANT: [
    'dashboard:view',
    'orders:read',
    'finance:read', 'finance:payout', 'finance:emi',
    'reports:view', 'reports:export',
  ],
  SERVICE_MANAGER: [
    'dashboard:view',
    'services:read', 'services:write',
    'jobs:read', 'jobs:manage',
    'technicians:read', 'technicians:assign',
    'reviews:read', 'reviews:moderate',
    'reports:view',
  ],
  TECHNICIAN_MANAGER: [
    'dashboard:view',
    'technicians:read', 'technicians:verify', 'technicians:assign',
    'jobs:read', 'jobs:manage',
    'finance:payout',
  ],
  SUPPORT_AGENT: [
    'dashboard:view',
    'customers:read',
    'orders:read',
    'jobs:read',
    'support:read', 'support:reply',
    'reviews:read',
  ],
  CONTENT_MANAGER: [
    'dashboard:view',
    'cms:read', 'cms:write',
    'reviews:read', 'reviews:moderate',
  ],
};

export function hasPermission(
  user: { role?: string } | null | undefined,
  permission: AdminPermission
): boolean {
  if (!user || !user.role) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions) return false;

  return permissions.includes(permission);
}

export function isStaffOrAdmin(user: { role?: string } | null | undefined): boolean {
  if (!user || !user.role) return false;
  return Object.keys(ROLE_PERMISSIONS).includes(user.role);
}
