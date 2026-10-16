/**
 * Feature Flags for NEED ELECTRO Platform
 * Service-First Electrical & Technology Marketplace
 */

export const FEATURE_FLAGS = {
  // E-commerce/Shop is de-emphasized or hidden behind this flag
  // Set NEXT_PUBLIC_ENABLE_SHOP="true" in environment to re-enable standalone public shopping catalog
  ENABLE_SHOP: process.env.NEXT_PUBLIC_ENABLE_SHOP === 'true',

  // Service-First Core Architecture Modes
  SERVICE_FIRST_MODE: true,
  PARTS_CATALOG_ENABLED: true,

  // Service-First Core Features (Always Active)
  ENABLE_SERVICE_BOOKING: true,
  ENABLE_EMERGENCY_DISPATCH: true,
  ENABLE_TECHNICIAN_PORTAL: true,
  ENABLE_SERVICE_WARRANTY: true,
  ENABLE_ONLINE_PAYMENT: true,
  ENABLE_PARTS_CATALOG: true, // Secondary parts/materials for service jobs
};

export function isShopEnabled(): boolean {
  return FEATURE_FLAGS.ENABLE_SHOP;
}
