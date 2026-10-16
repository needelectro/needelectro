import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('Seeding NEED ELECTRO database...');

  // Passwords
  const adminRawPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@needelectro.com';
  const adminPhone = process.env.ADMIN_PHONE || '01733983752';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  const adminPassword = await bcrypt.hash(adminRawPassword, 10);
  const techPassword = await bcrypt.hash('tech123', 10);
  const custPassword = await bcrypt.hash('cust123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPassword,
      phone: adminPhone,
      name: adminName,
    },
    create: {
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const techUser1 = await prisma.user.upsert({
    where: { email: 'kalam@needelectro.com' },
    update: {},
    create: {
      name: 'Md. Abul Kalam',
      email: 'kalam@needelectro.com',
      phone: '01711223344',
      passwordHash: techPassword,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const techUser2 = await prisma.user.upsert({
    where: { email: 'tariq@needelectro.com' },
    update: {},
    create: {
      name: 'Tariqul Islam',
      email: 'tariq@needelectro.com',
      phone: '01811223355',
      passwordHash: techPassword,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const techUserPending = await prisma.user.upsert({
    where: { email: 'rashed@needelectro.com' },
    update: {},
    create: {
      name: 'Rashed Ahmed',
      email: 'rashed@needelectro.com',
      phone: '01911223366',
      passwordHash: techPassword,
      role: 'TECHNICIAN',
      status: 'PENDING',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@needelectro.com' },
    update: {},
    create: {
      name: 'Tanvir Rahman',
      email: 'customer@needelectro.com',
      phone: '01712345678',
      passwordHash: custPassword,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create Customer Profile & Address
  const customerProfile = await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      alternativePhone: '01899887766',
    },
  });

  const customerAddress = await prisma.address.create({
    data: {
      customerId: customerProfile.id,
      label: 'Home',
      recipientName: 'Tanvir Rahman',
      phone: '01712345678',
      division: 'Sylhet',
      district: 'Moulvibazar',
      upazila: 'Moulvibazar Sadar',
      area: 'Kusumbag Residential Area',
      addressLine: 'Holding #42, Road #3, Near Central Jame Masjid',
      landmark: 'Near Kusumbag Point',
      isDefault: true,
    },
  });

  // 3. Create Technician Profiles
  const techProfile1 = await prisma.technicianProfile.upsert({
    where: { userId: techUser1.id },
    update: {},
    create: {
      userId: techUser1.id,
      bio: 'Certified Master Electrician with 8+ years experience in commercial house wiring, distribution boards, and industrial electrical troubleshooting.',
      nidNumber: '1987581290345612',
      experienceYears: 8,
      skills: JSON.stringify(['House Wiring', 'Distribution Board', 'IPS/UPS Setup', 'Emergency Troubleshooting', 'Light & Fan Setup']),
      specializations: 'Residential & Commercial Electrical Systems',
      serviceAreas: 'Moulvibazar Sadar, Kusumbag, Sreemangal Road, Court Road',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'NID and Trade Certificate verified by NEED ELECTRO Admin.',
      verifiedAt: new Date('2025-01-10'),
      emergencyAvailable: true,
      workingHours: '8:00 AM - 9:00 PM',
      preferredRadiusKm: 20,
      availableStatus: 'AVAILABLE',
      walletBalance: 4250.0,
      totalWithdrawn: 12000.0,
      ratingOverall: 4.9,
      ratingProfessionalism: 4.95,
      ratingQuality: 4.9,
      ratingPunctuality: 4.85,
      ratingBehavior: 5.0,
      totalCompletedJobs: 48,
      totalReviews: 32,
    },
  });

  const techProfile2 = await prisma.technicianProfile.upsert({
    where: { userId: techUser2.id },
    update: {},
    create: {
      userId: techUser2.id,
      bio: 'Expert IT, CCTV Security, and Networking Technician. Certified in Dahua/Hikvision camera setups, router configurations, and laptop hardware repair.',
      nidNumber: '1992581290887766',
      experienceYears: 5,
      skills: JSON.stringify(['CCTV Installation', 'DVR/NVR Configuration', 'Wi-Fi & Networking', 'Laptop Troubleshooting', 'OS Deployment']),
      specializations: 'CCTV Security & Computer Technologies',
      serviceAreas: 'Moulvibazar Sadar, Kusumbag, Shamshernagar, Rajnagar',
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Dahua Certification and Polytechnic Diploma verified.',
      verifiedAt: new Date('2025-02-15'),
      emergencyAvailable: false,
      workingHours: '9:00 AM - 7:00 PM',
      preferredRadiusKm: 15,
      availableStatus: 'AVAILABLE',
      walletBalance: 2800.0,
      totalWithdrawn: 8500.0,
      ratingOverall: 4.85,
      ratingProfessionalism: 4.8,
      ratingQuality: 4.9,
      ratingPunctuality: 4.8,
      ratingBehavior: 4.9,
      totalCompletedJobs: 31,
      totalReviews: 24,
    },
  });

  await prisma.technicianProfile.upsert({
    where: { userId: techUserPending.id },
    update: {},
    create: {
      userId: techUserPending.id,
      bio: 'Junior Technician skilled in CCTV setup and domestic fan/light installations. Looking forward to completing high-standard jobs.',
      nidNumber: '1998581290334455',
      experienceYears: 2,
      skills: JSON.stringify(['CCTV Setup', 'Light Installation', 'Fan Repair']),
      specializations: 'Security Camera Assistance',
      serviceAreas: 'Moulvibazar Sadar',
      verificationStatus: 'PENDING',
      verificationNotes: 'Application submitted, awaiting NID physical cross-check.',
      emergencyAvailable: false,
      workingHours: '10:00 AM - 6:00 PM',
      preferredRadiusKm: 10,
      availableStatus: 'OFFLINE',
      walletBalance: 0.0,
    },
  });

  // 4. Create Service Categories
  const catElectrical = await prisma.serviceCategory.upsert({
    where: { slug: 'electrical-services' },
    update: {},
    create: {
      name: 'Electrical Services',
      slug: 'electrical-services',
      description: 'Professional home & commercial electrical wiring, troubleshooting, switchboard, and fixture installations.',
      icon: 'Zap',
      sortOrder: 1,
    },
  });

  const catCCTV = await prisma.serviceCategory.upsert({
    where: { slug: 'cctv-security' },
    update: {},
    create: {
      name: 'CCTV & Security Solutions',
      slug: 'cctv-security',
      description: 'End-to-end HD/IP camera installation, DVR/NVR network setup, night vision, and surveillance maintenance.',
      icon: 'Shield',
      sortOrder: 2,
    },
  });

  const catComputer = await prisma.serviceCategory.upsert({
    where: { slug: 'computer-laptop-services' },
    update: {},
    create: {
      name: 'Computer & Laptop Services',
      slug: 'computer-laptop-services',
      description: 'Hardware diagnostics, OS installation, motherboard repair, upgrades, and high-speed office networking.',
      icon: 'Monitor',
      sortOrder: 3,
    },
  });

  const catSmart = await prisma.serviceCategory.upsert({
    where: { slug: 'smart-electrical-solutions' },
    update: {},
    create: {
      name: 'Smart Electrical Solutions',
      slug: 'smart-electrical-solutions',
      description: 'Smart Wi-Fi switches, app-controlled lighting, IPS inverter integration, and solar backup systems.',
      icon: 'Cpu',
      sortOrder: 4,
    },
  });

  // 5. Create Services
  const srvHouseWiring = await prisma.service.upsert({
    where: { slug: 'complete-house-electrical-wiring' },
    update: {},
    create: {
      categoryId: catElectrical.id,
      name: 'Complete House Electrical Wiring',
      slug: 'complete-house-electrical-wiring',
      shortDescription: 'Safe, standard-gauge copper conduit wiring, distribution box setting, and earth leakage protection.',
      fullDescription: 'Comprehensive residential and commercial wiring engineered for long-term safety. Includes concealed conduit laying, load calculation, circuit breaker panel assembly, surge protection, and earthing testing by certified electricians.',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      basePrice: 1500.0,
      priceType: 'INSPECTION_BASED',
      estimatedDuration: '1-3 Days',
      requiredSkills: 'House Wiring, Circuit Breaker, Earthing',
      isEmergencyService: false,
      sortOrder: 1,
    },
  });

  const srvEmergency = await prisma.service.upsert({
    where: { slug: 'emergency-electrical-troubleshooting' },
    update: {},
    create: {
      categoryId: catElectrical.id,
      name: '24/7 Emergency Electrical Troubleshooting',
      slug: 'emergency-electrical-troubleshooting',
      shortDescription: 'Rapid response for short circuits, sparking, sudden blackouts, and electrical hazards in Moulvibazar.',
      fullDescription: 'Urgent troubleshooting dispatched within 30 minutes. Qualified technicians with insulation gear quickly locate circuit breaks, faulty main switches, burnt wiring, and restore safe power.',
      imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&auto=format&fit=crop&q=80',
      basePrice: 500.0,
      priceType: 'STARTING_FROM',
      estimatedDuration: '45-90 Mins',
      requiredSkills: 'Emergency Troubleshooting, Short Circuit, Safety',
      isEmergencyService: true,
      sortOrder: 2,
    },
  });

  const srvCCTV = await prisma.service.upsert({
    where: { slug: 'cctv-camera-installation-setup' },
    update: {},
    create: {
      categoryId: catCCTV.id,
      name: 'CCTV Camera Complete Installation & Setup',
      slug: 'cctv-camera-installation-setup',
      shortDescription: '4/8/16 Channel HD/IP surveillance system mounting, wiring, DVR/NVR configuration, and mobile live-view setup.',
      fullDescription: 'Professional security camera deployment for homes, shops, and offices. Includes neat coaxial/Cat6 cable concealment, waterproof junction boxes, hard disk formatting, remote phone streaming setup, and night vision calibration.',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
      basePrice: 1200.0,
      priceType: 'STARTING_FROM',
      estimatedDuration: '3-5 Hours',
      requiredSkills: 'CCTV Installation, DVR/NVR Configuration, Remote Mobile Setup',
      isEmergencyService: false,
      sortOrder: 3,
    },
  });

  const srvLaptop = await prisma.service.upsert({
    where: { slug: 'laptop-desktop-hardware-servicing' },
    update: {},
    create: {
      categoryId: catComputer.id,
      name: 'Laptop & Desktop Hardware Diagnostics & Repair',
      slug: 'laptop-desktop-hardware-servicing',
      shortDescription: 'Fast thermal paste repaste, SSD/RAM upgrade, display replacement, hinge repair, and OS clean installation.',
      fullDescription: 'Reliable computer lab diagnostics. We resolve overheating, slow boot, blue screens, corrupted Windows/Linux installations, liquid damage inspection, and motherboard chip-level checks.',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      basePrice: 600.0,
      priceType: 'STARTING_FROM',
      estimatedDuration: '2-4 Hours',
      requiredSkills: 'Laptop Diagnostics, RAM/SSD Upgrade, OS Setup',
      isEmergencyService: false,
      sortOrder: 4,
    },
  });

  const srvIPS = await prisma.service.upsert({
    where: { slug: 'ips-ups-solar-inverter-installation' },
    update: {},
    create: {
      categoryId: catSmart.id,
      name: 'IPS / UPS & Solar Inverter Setup',
      slug: 'ips-ups-solar-inverter-installation',
      shortDescription: 'Heavy-duty battery connection, automatic transfer switch wiring, distilled water service, and load balancing.',
      fullDescription: 'Safe battery bank and pure sine wave inverter integration. Ensures zero-break power transitions for sensitive computers, Wi-Fi routers, fans, and medical appliances during load shedding.',
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      basePrice: 800.0,
      priceType: 'FIXED',
      estimatedDuration: '1-2 Hours',
      requiredSkills: 'IPS Setup, Inverter Load Balancing, Battery Safety',
      isEmergencyService: false,
      sortOrder: 5,
    },
  });

  // 6. Create Product Categories & Brands
  const pCatLaptop = await prisma.productCategory.upsert({
    where: { slug: 'laptops-computers' },
    update: {},
    create: {
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'Business laptops, workstations, custom desktop PCs, monitors, and genuine components.',
    },
  });

  const pCatSecurity = await prisma.productCategory.upsert({
    where: { slug: 'cctv-surveillance' },
    update: {},
    create: {
      name: 'CCTV & Surveillance',
      slug: 'cctv-surveillance',
      description: 'HD cameras, IP cameras, 4-16 Channel DVRs/NVRs, hard drives, and power supplies.',
    },
  });

  const pCatNetwork = await prisma.productCategory.upsert({
    where: { slug: 'networking-accessories' },
    update: {},
    create: {
      name: 'Networking & Connectivity',
      slug: 'networking-accessories',
      description: 'High-speed gigabit Wi-Fi 6 routers, switches, Cat6 patch cords, and fiber optic accessories.',
    },
  });

  const pCatElectrical = await prisma.productCategory.upsert({
    where: { slug: 'electrical-smart-devices' },
    update: {},
    create: {
      name: 'Electrical & Smart Devices',
      slug: 'electrical-smart-devices',
      description: 'Pure sine wave IPS, smart Wi-Fi switchboards, surge protectors, and industrial circuit breakers.',
    },
  });

  const brandHP = await prisma.brand.upsert({
    where: { slug: 'hp' },
    update: {},
    create: { name: 'HP', slug: 'hp' },
  });

  const brandDahua = await prisma.brand.upsert({
    where: { slug: 'dahua' },
    update: {},
    create: { name: 'Dahua', slug: 'dahua' },
  });

  const brandTPLink = await prisma.brand.upsert({
    where: { slug: 'tp-link' },
    update: {},
    create: { name: 'TP-Link', slug: 'tp-link' },
  });

  const brandLuminous = await prisma.brand.upsert({
    where: { slug: 'luminous' },
    update: {},
    create: { name: 'Luminous', slug: 'luminous' },
  });

  // 7. Products & Warranties are managed via Admin Portal or ERP integration
  // (Demo mock products removed for production readiness)

  // 8. Active Operational Bookings
  // Booking 1: Assigned to Abul Kalam (status: ON_THE_WAY)
  const booking1 = await prisma.booking.upsert({
    where: { bookingNumber: 'NE202610010001' },
    update: {},
    create: {
      bookingNumber: 'NE202610010001',
      customerId: customerProfile.id,
      technicianId: techProfile1.id,
      serviceId: srvHouseWiring.id,
      problemDescription: 'Inspection and new circuit breaker installation for 2nd floor renovation.',
      addressId: customerAddress.id,
      preferredDate: '2026-10-10',
      preferredTimeSlot: '10:00 AM - 12:00 PM',
      urgency: 'NORMAL',
      status: 'ON_THE_WAY',
      totalAmount: 1500.0,
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH_ON_DELIVERY',
      customerNotes: 'Please bring an earthing voltage tester.',
    },
  });

  await prisma.bookingTimeline.createMany({
    data: [
      { bookingId: booking1.id, status: 'RECEIVED', actorRole: 'CUSTOMER', note: 'Booking requested by customer.' },
      { bookingId: booking1.id, status: 'ASSIGNED', actorRole: 'SYSTEM', note: 'Assigned to Md. Abul Kalam.' },
      { bookingId: booking1.id, status: 'ON_THE_WAY', actorRole: 'TECHNICIAN', note: 'Technician on the way to Kusumbag.' },
    ],
  });

  // Booking 2: Available in Marketplace for any eligible verified technician to accept
  const booking2 = await prisma.booking.upsert({
    where: { bookingNumber: 'NE202610020002' },
    update: {},
    create: {
      bookingNumber: 'NE202610020002',
      customerId: customerProfile.id,
      serviceId: srvCCTV.id,
      problemDescription: 'Need 4 Dahua CCTV cameras mounted with clean concealment wiring at our pharmacy store in Kusumbag.',
      addressId: customerAddress.id,
      preferredDate: '2026-10-11',
      preferredTimeSlot: '02:00 PM - 05:00 PM',
      urgency: 'NORMAL',
      status: 'MATCHING',
      totalAmount: 1800.0,
      paymentStatus: 'PENDING',
      paymentMethod: 'BKASH',
      customerNotes: 'Cables and cameras already purchased from NEED ELECTRO.',
    },
  });

  // 9. Service Areas & Nationwide Hubs
  const areaMoulvibazar = await prisma.serviceArea.upsert({
    where: { id: 'sa-moulvibazar-sadar' },
    update: {},
    create: {
      id: 'sa-moulvibazar-sadar',
      district: 'Moulvibazar',
      thana: 'Moulvibazar Sadar',
      area: 'Kusumbag Point',
      isActive: true,
      serviceRadiusKm: 25,
    },
  });

  const areaDhaka = await prisma.serviceArea.upsert({
    where: { id: 'sa-dhaka-gulshan' },
    update: {},
    create: {
      id: 'sa-dhaka-gulshan',
      district: 'Dhaka',
      thana: 'Gulshan',
      area: 'Gulshan-2 & Banani',
      isActive: true,
      serviceRadiusKm: 30,
    },
  });

  // 10. Spare Parts & Materials Catalog
  const partBreaker = await prisma.part.upsert({
    where: { sku: 'SCH-CB-16A' },
    update: {},
    create: {
      sku: 'SCH-CB-16A',
      name: 'Schneider Electric 16A Miniature Circuit Breaker (MCB)',
      category: 'ELECTRICAL_MATERIALS',
      price: 380.0,
      costPrice: 290.0,
      stock: 150,
      unit: 'piece',
      isAvailable: true,
    },
  });

  const partCable = await prisma.part.upsert({
    where: { sku: 'BRB-CU-15RM' },
    update: {},
    create: {
      sku: 'BRB-CU-15RM',
      name: 'BRB 1.5 RM Copper Fire-Retardant House Wiring Cable',
      category: 'ELECTRICAL_MATERIALS',
      price: 68.0,
      costPrice: 52.0,
      stock: 500,
      unit: 'meter',
      isAvailable: true,
    },
  });

  const partBNC = await prisma.part.upsert({
    where: { sku: 'DH-BNC-CON' },
    update: {},
    create: {
      sku: 'DH-BNC-CON',
      name: 'Dahua Pure Copper Gold-Plated BNC Video Connector',
      category: 'CCTV_ACCESSORIES',
      price: 35.0,
      costPrice: 20.0,
      stock: 300,
      unit: 'piece',
      isAvailable: true,
    },
  });

  // Booking 3: Full Completed Lifecycle with Quote, Parts, Invoice, Warranty & Review
  const booking3 = await prisma.booking.upsert({
    where: { bookingNumber: 'NE202610030003' },
    update: {},
    create: {
      bookingNumber: 'NE202610030003',
      customerId: customerProfile.id,
      technicianId: techProfile1.id,
      serviceId: srvHouseWiring.id,
      problemDescription: 'Main circuit breaker replacement and load balancing for ground floor commercial office.',
      addressId: customerAddress.id,
      thana: 'Moulvibazar Sadar',
      preferredDate: '2026-10-08',
      preferredTimeSlot: '11:00 AM - 01:00 PM',
      urgency: 'NORMAL',
      status: 'PAID',
      totalAmount: 1880.0, // 1500 labor + 380 breaker
      paymentStatus: 'PAID',
      paymentMethod: 'BKASH',
      customerNotes: 'Completed smoothly with official 30-day warranty.',
      completedAt: new Date('2026-10-08T14:30:00Z'),
    },
  });

  // Quote for Booking 3
  await prisma.quote.upsert({
    where: { quoteNumber: 'QT202610030003' },
    update: {},
    create: {
      quoteNumber: 'QT202610030003',
      bookingId: booking3.id,
      laborCost: 1500.0,
      partsCost: 380.0,
      discount: 0.0,
      totalAmount: 1880.0,
      notes: 'Schneider 16A MCB supplied directly by NEED ELECTRO technician.',
      validUntil: new Date('2026-10-15T00:00:00Z'),
      status: 'ACCEPTED',
    },
  });

  // Job Assignment for Booking 3
  await prisma.jobAssignment.upsert({
    where: { id: 'ja-booking3' },
    update: {},
    create: {
      id: 'ja-booking3',
      bookingId: booking3.id,
      technicianId: techProfile1.id,
      status: 'COMPLETED',
      offeredAt: new Date('2026-10-08T09:00:00Z'),
      respondedAt: new Date('2026-10-08T09:05:00Z'),
      notes: 'Accepted within 5 minutes and executed to safety code.',
    },
  });

  // Parts used in Booking 3
  await prisma.bookingPart.upsert({
    where: { id: 'bp-booking3-breaker' },
    update: {},
    create: {
      id: 'bp-booking3-breaker',
      bookingId: booking3.id,
      partId: partBreaker.id,
      quantity: 1,
      unitPrice: 380.0,
      totalPrice: 380.0,
      addedBy: 'TECHNICIAN',
    },
  });

  // Invoice for Booking 3
  const invoice3 = await prisma.serviceInvoice.upsert({
    where: { invoiceNumber: 'INV-SRV-20261003001' },
    update: {},
    create: {
      invoiceNumber: 'INV-SRV-20261003001',
      bookingId: booking3.id,
      laborAmount: 1500.0,
      partsAmount: 380.0,
      totalAmount: 1880.0,
      paymentStatus: 'PAID',
      paymentMethod: 'BKASH',
      paidAt: new Date('2026-10-08T14:35:00Z'),
    },
  });

  // Service Payment for Booking 3
  await prisma.servicePayment.upsert({
    where: { paymentNumber: 'PAY-20261003001' },
    update: {},
    create: {
      paymentNumber: 'PAY-20261003001',
      invoiceId: invoice3.id,
      bookingId: booking3.id,
      amount: 1880.0,
      paymentType: 'FINAL',
      paymentMethod: 'BKASH',
      trxId: 'BKASH9X7A221',
      status: 'PAID',
      paidAt: new Date('2026-10-08T14:35:00Z'),
    },
  });

  // Service Warranty for Booking 3 (30 days)
  await prisma.serviceWarranty.upsert({
    where: { warrantyNumber: 'WR-20261003001' },
    update: {},
    create: {
      warrantyNumber: 'WR-20261003001',
      invoiceId: invoice3.id,
      bookingId: booking3.id,
      serviceTitle: 'Complete House Electrical Wiring & Breaker Panel',
      warrantyPeriodDays: 30,
      startDate: new Date('2026-10-08T14:30:00Z'),
      expiryDate: new Date('2026-11-07T14:30:00Z'),
      terms: 'Covers workmanship, terminal joints, and installation safety for 30 calendar days.',
      status: 'ACTIVE',
    },
  });

  // Customer Review for Booking 3
  await prisma.review.upsert({
    where: { id: 'rev-booking3' },
    update: {},
    create: {
      id: 'rev-booking3',
      customerId: customerProfile.id,
      bookingId: booking3.id,
      technicianId: techProfile1.id,
      rating: 5,
      ratingProfessionalism: 5,
      ratingQuality: 5,
      ratingPunctuality: 5,
      ratingBehavior: 5,
      comment: 'Md. Abul Kalam arrived promptly with proper safety shoes and tester. Replaced the MCB neatly and tested our ground voltage. Highly recommended!',
      isApproved: true,
    },
  });

  // 10. Sample Technician Wallet Transactions
  await prisma.walletTransaction.create({
    data: {
      technicianId: techProfile1.id,
      type: 'JOB_EARNING',
      amount: 1275.0,
      balanceAfter: 4250.0,
      description: 'Earned from House Wiring Job #NE202609280014 (85% share)',
      status: 'COMPLETED',
      referenceId: 'NE202609280014',
    },
  });

  // 11. Initial System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'platform_commission_rate' },
    update: {},
    create: {
      key: 'platform_commission_rate',
      value: '15',
      description: 'Platform commission percentage retained from service jobs (default 15%).',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'main_branch_location' },
    update: {},
    create: {
      key: 'main_branch_location',
      value: 'Kusumbag Point, Moulvibazar Sadar, Moulvibazar 3200',
      description: 'Headquarters physical address.',
    },
  });

  // 12. Training Courses
  await prisma.trainingCourse.upsert({
    where: { slug: 'master-domestic-commercial-electrical' },
    update: {},
    create: {
      title: 'Master Domestic & Commercial Electrical Engineering',
      slug: 'master-domestic-commercial-electrical',
      category: 'ELECTRICAL',
      shortDescription: 'Comprehensive hands-on training on residential distribution boards, load calculation, and safety standards.',
      fullDescription: 'From conduit routing to three-phase industrial balance, this 8-week program equips aspiring technicians with professional trade skills, multimeter diagnostics, and government safety code compliance.',
      durationWeeks: 8,
      totalHours: 64,
      fee: 4500.0,
      certificationIncluded: true,
      syllabus: JSON.stringify(['Electrical Safety & PPE', 'Single & 3-Phase Circuit Design', 'Distribution Boards & Breakers', 'Earthing & Lightning Arresters', 'Solar IPS Interfacing']),
      prerequisites: 'SSC or basic electrical knowledge',
      careerOutcomes: 'Direct employment at NEED ELECTRO, licensed electrician status, contractor eligibility.',
      instructorName: 'Engr. Rafiqul Islam, NEED ELECTRO Lab Lead'
    }
  });

  await prisma.trainingCourse.upsert({
    where: { slug: 'cctv-ip-camera-networking' },
    update: {},
    create: {
      title: 'CCTV Surveillance & IP Networking Professional',
      slug: 'cctv-ip-camera-networking',
      category: 'CCTV',
      shortDescription: 'Master analog HD, IP cameras, NVR configuration, remote mobile monitoring, and optical fiber slicing.',
      fullDescription: 'Learn complete physical and network topology deployment for Dahua, Hikvision, and Uniview surveillance architectures with cloud P2P remote monitoring.',
      durationWeeks: 6,
      totalHours: 48,
      fee: 3800.0,
      certificationIncluded: true,
      syllabus: JSON.stringify(['Analog vs IP Architecture', 'NVR/DVR Firmware & Storage', 'Subnetting & Port Forwarding', 'PTZ Speed Dome Setup', 'Optical Fiber Termination']),
      prerequisites: 'Basic computer literacy',
      careerOutcomes: 'Security technician, IT infrastructure supervisor.',
      instructorName: 'Engr. Tariqul Islam, Security Specialist'
    }
  });

  // 13. Regional Branches
  await prisma.branch.upsert({
    where: { slug: 'moulvibazar-hq' },
    update: {},
    create: {
      name: 'Moulvibazar Central Headquarters & Technical Lab',
      slug: 'moulvibazar-hq',
      division: 'Sylhet',
      district: 'Moulvibazar',
      upazila: 'Moulvibazar Sadar',
      address: 'Kusumbag Point, Moulvibazar Sadar, Moulvibazar 3200',
      phone: '01733 983752',
      email: 'moulvibazar@needelectro.com',
      managerName: 'Kalam Ahmed',
      isHeadquarters: true,
      coverageAreas: 'Moulvibazar Sadar, Kusumbag, Court Road, Shamshernagar Road',
      workingHours: 'Saturday - Thursday: 9:00 AM - 8:30 PM',
      emergencyHotline: '01733 983752'
    }
  });

  await prisma.branch.upsert({
    where: { slug: 'sreemangal-hub' },
    update: {},
    create: {
      name: 'Sreemangal Regional Service Hub',
      slug: 'sreemangal-hub',
      division: 'Sylhet',
      district: 'Moulvibazar',
      upazila: 'Sreemangal',
      address: 'College Road, Near Chowmohona, Sreemangal',
      phone: '01711 223344',
      email: 'sreemangal@needelectro.com',
      managerName: 'Tariqul Islam',
      isHeadquarters: false,
      coverageAreas: 'Sreemangal Town, Radhanagar, Kalighat, Tea Estate Hubs',
      workingHours: 'Saturday - Thursday: 9:30 AM - 8:00 PM',
      emergencyHotline: '01711 223344'
    }
  });

  // 14. Seller Profile
  await prisma.sellerProfile.upsert({
    where: { slug: 'apex-electrical-supplies' },
    update: {},
    create: {
      businessName: 'Apex Electrical Supplies & Cables',
      slug: 'apex-electrical-supplies',
      tradeLicenseNumber: 'TRAD/MOUL/2024/09811',
      contactPerson: 'Haji Mustaq Ahmed',
      phone: '01819 887766',
      email: 'apex.supplies@gmail.com',
      address: 'Station Road, Moulvibazar Sadar',
      productCategories: 'BRB Cables, Schneider Switches, ABB Circuit Breakers',
      commissionRate: 7.5,
      status: 'VERIFIED',
      adminNotes: 'Verified trade license and physical shop inspection passed.'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
