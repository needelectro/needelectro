-- NEED ELECTRO: Service-First Marketplace Architecture Migration
-- Preserves existing customers, technicians, bookings, and users

-- CreateTable ServiceArea
CREATE TABLE IF NOT EXISTS "ServiceArea" (
    "id" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'Sylhet',
    "district" TEXT NOT NULL,
    "thana" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable TechnicianSkill
CREATE TABLE IF NOT EXISTS "TechnicianSkill" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "category" TEXT DEFAULT 'ELECTRICAL',
    "experienceYears" INTEGER NOT NULL DEFAULT 1,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TechnicianSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable TechnicianServiceArea
CREATE TABLE IF NOT EXISTS "TechnicianServiceArea" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'Sylhet',
    "district" TEXT NOT NULL,
    "thana" TEXT NOT NULL,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TechnicianServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable AvailabilitySlot
CREATE TABLE IF NOT EXISTS "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable Quote
CREATE TABLE IF NOT EXISTS "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable JobAssignment
CREATE TABLE IF NOT EXISTS "JobAssignment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFERED',
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "JobAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable ServiceInvoice
CREATE TABLE IF NOT EXISTS "ServiceInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "laborAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "partsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable ServicePayment
CREATE TABLE IF NOT EXISTS "ServicePayment" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentType" TEXT NOT NULL DEFAULT 'FINAL',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
    "trxId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable ServiceWarranty
CREATE TABLE IF NOT EXISTS "ServiceWarranty" (
    "id" TEXT NOT NULL,
    "warrantyNumber" TEXT NOT NULL,
    "invoiceId" TEXT,
    "bookingId" TEXT NOT NULL,
    "serviceTitle" TEXT NOT NULL,
    "warrantyPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "terms" TEXT NOT NULL DEFAULT 'Covers workmanship and installation defects for 30 days.',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceWarranty_pkey" PRIMARY KEY ("id")
);

-- CreateTable Part
CREATE TABLE IF NOT EXISTS "Part" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ELECTRICAL_MATERIALS',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "unit" TEXT NOT NULL DEFAULT 'piece',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable BookingPart
CREATE TABLE IF NOT EXISTS "BookingPart" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingPart_pkey" PRIMARY KEY ("id")
);

-- Non-destructive column extensions for Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "thana" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "estimatedBudget" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "beforePhotos" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "afterPhotos" TEXT;

-- Create Indexes
CREATE INDEX IF NOT EXISTS "ServiceArea_district_thana_idx" ON "ServiceArea"("district", "thana");
CREATE INDEX IF NOT EXISTS "TechnicianSkill_technicianId_idx" ON "TechnicianSkill"("technicianId");
CREATE INDEX IF NOT EXISTS "TechnicianServiceArea_technicianId_idx" ON "TechnicianServiceArea"("technicianId");
CREATE INDEX IF NOT EXISTS "AvailabilitySlot_technicianId_idx" ON "AvailabilitySlot"("technicianId");
CREATE INDEX IF NOT EXISTS "Quote_bookingId_idx" ON "Quote"("bookingId");
CREATE INDEX IF NOT EXISTS "JobAssignment_bookingId_idx" ON "JobAssignment"("bookingId");
CREATE INDEX IF NOT EXISTS "JobAssignment_technicianId_idx" ON "JobAssignment"("technicianId");
CREATE INDEX IF NOT EXISTS "ServicePayment_bookingId_idx" ON "ServicePayment"("bookingId");
CREATE INDEX IF NOT EXISTS "BookingPart_bookingId_idx" ON "BookingPart"("bookingId");
CREATE INDEX IF NOT EXISTS "BookingPart_partId_idx" ON "BookingPart"("partId");
