import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sampleParts = [
    { sku: 'ELC-MCB-16A', name: '16A Single Pole Circuit Breaker (Schneider/ABB)', category: 'ELECTRICAL_MATERIALS', price: 450, costPrice: 320, stock: 50, unit: 'piece' },
    { sku: 'ELC-CBL-2.5', name: '2.5 RM BRB Copper Cable (Single Core)', category: 'ELECTRICAL_MATERIALS', price: 85, costPrice: 65, stock: 500, unit: 'meter' },
    { sku: 'CCT-BNC-CON', name: 'High-Grade Copper BNC Video Balun Connector Pair', category: 'CCTV_HARDWARE', price: 120, costPrice: 70, stock: 150, unit: 'pair' },
    { sku: 'CCT-PWR-12V', name: '12V 2A Regulated CCTV DC Power Adapter', category: 'CCTV_HARDWARE', price: 350, costPrice: 220, stock: 60, unit: 'piece' },
    { sku: 'CMP-THM-PST', name: 'Arctic MX-4 High Performance Thermal Paste (4g)', category: 'COMPUTER_COMPONENTS', price: 650, costPrice: 450, stock: 30, unit: 'tube' },
    { sku: 'CMP-SSD-256', name: '256GB M.2 NVMe PCIe Solid State Drive (Hikvision)', category: 'COMPUTER_COMPONENTS', price: 2400, costPrice: 1900, stock: 25, unit: 'piece' },
  ];

  for (const p of sampleParts) {
    await prisma.part.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  console.log('Parts seeded successfully. Count:', sampleParts.length);
  await prisma.$disconnect();
}

main().catch(console.error);
