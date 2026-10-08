import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NEED ELECTRO database...');

  // Passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const techPassword = await bcrypt.hash('tech123', 10);
  const custPassword = await bcrypt.hash('cust123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@needelectro.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@needelectro.com',
      phone: '01733983752',
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

  // 7. Create Products
  const prodLaptop = await prisma.product.upsert({
    where: { slug: 'hp-elitebook-840-g8-intel-core-i5' },
    update: {},
    create: {
      categoryId: pCatLaptop.id,
      brandId: brandHP.id,
      name: 'HP EliteBook 840 G8 (Intel Core i5-1135G7, 16GB RAM, 512GB NVMe SSD)',
      slug: 'hp-elitebook-840-g8-intel-core-i5',
      sku: 'LAP-HP-840G8-11TH',
      shortDescription: '14" FHD IPS Matte Display, Aluminum chassis, Backlit Keyboard, Fingerprint Reader, 12 Month NEED ELECTRO Official Warranty.',
      description: 'The HP EliteBook 840 G8 is an ultra-reliable enterprise laptop designed for executives, developers, and power users. Tested and verified in our Moulvibazar technology lab with genuine Windows 11 Pro.',
      specifications: JSON.stringify({
        'Processor': 'Intel Core i5-1135G7 11th Gen (Up to 4.20 GHz)',
        'RAM': '16GB DDR4 3200MHz (Dual Channel)',
        'Storage': '512GB M.2 NVMe PCIe SSD',
        'Display': '14.0" Full HD (1920x1080) Anti-Glare IPS 400 nits',
        'Battery': '3-Cell 53Wh Li-ion (Up to 8 Hours Backup)',
        'Ports': '2x Thunderbolt 4 Type-C, 2x USB 3.2 Gen 1, 1x HDMI 2.0b, Audio Combo',
      }),
      price: 52000.0,
      discountPrice: 48500.0,
      stock: 6,
      condition: 'REFURBISHED',
      warrantyPeriodMonths: 12,
      images: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      isActive: true,
    },
  });

  const prodCCTV = await prisma.product.upsert({
    where: { slug: 'dahua-4-camera-hd-cctv-surveillance-package' },
    update: {},
    create: {
      categoryId: pCatSecurity.id,
      brandId: brandDahua.id,
      name: 'Dahua 4-Camera HD 1080p Night-Vision CCTV Security Package',
      slug: 'dahua-4-camera-hd-cctv-surveillance-package',
      sku: 'SEC-DH-4CAM-1080P',
      shortDescription: 'Includes 4x 2MP Dahua Bullet/Dome Cameras, 4CH XVR, 1TB Seagate Surveillance HDD, Central Power Supply & Connectors.',
      description: 'Complete peace-of-mind security bundle for houses and commercial stores. Smart IR night vision up to 20 meters, weatherproof IP67 rated, and free mobile app setup by NEED ELECTRO engineers.',
      specifications: JSON.stringify({
        'Camera Count': '4x (2 Indoor Dome + 2 Weatherproof Bullet)',
        'Resolution': '1080p Full HD (2.0 Megapixel)',
        'Night Vision': 'Smart IR LED Up to 20 Meters',
        'Storage Included': '1TB Seagate SkyHawk 24/7 Surveillance HDD',
        'Mobile App': 'DMSS (iOS & Android) with Push Alert',
      }),
      price: 18500.0,
      discountPrice: 16800.0,
      stock: 12,
      condition: 'NEW',
      warrantyPeriodMonths: 24,
      images: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      isActive: true,
    },
  });

  const prodRouter = await prisma.product.upsert({
    where: { slug: 'tp-link-archer-ax55-ax3000-wifi-6-gigabit-router' },
    update: {},
    create: {
      categoryId: pCatNetwork.id,
      brandId: brandTPLink.id,
      name: 'TP-Link Archer AX55 Dual-Band Gigabit Wi-Fi 6 Router',
      slug: 'tp-link-archer-ax55-ax3000-wifi-6-gigabit-router',
      sku: 'NET-TPL-AX55-PRO',
      shortDescription: 'Next-Gen 3 Gbps Wi-Fi 6 speeds, Qualcomm chipset, 4 High-Gain Antennas with Beamforming, USB 3.0 file sharing.',
      description: 'Eliminates lag and buffer across dozens of devices simultaneously. Ideal for gaming, 4K streaming, and fiber optical connections.',
      specifications: JSON.stringify({
        'Speed': '2402 Mbps (5 GHz) + 574 Mbps (2.4 GHz)',
        'Antennas': '4x High-Performance External Antennas',
        'Ports': '1x Gigabit WAN, 4x Gigabit LAN, 1x USB 3.0',
        'Security': 'HomeShield WPA3 Personal Security',
      }),
      price: 6800.0,
      discountPrice: 6200.0,
      stock: 15,
      condition: 'NEW',
      warrantyPeriodMonths: 24,
      images: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      isActive: true,
    },
  });

  const prodIPS = await prisma.product.upsert({
    where: { slug: 'luminous-zelio-1100va-pure-sine-wave-ips' },
    update: {},
    create: {
      categoryId: pCatElectrical.id,
      brandId: brandLuminous.id,
      name: 'Luminous Zelio+ 1100VA Pure Sine Wave Home UPS / IPS System',
      slug: 'luminous-zelio-1100va-pure-sine-wave-ips',
      sku: 'POW-LUM-ZELIO-1100',
      shortDescription: 'Smart LCD display showing battery charge & backup time, 32-bit DSP processor, supports all tubular battery types.',
      description: 'Zero hum sound on fans and zero fluctuation on laptops or smart televisions. Intelligent battery management prevents overcharging and prolongs battery lifespan.',
      specifications: JSON.stringify({
        'Capacity': '1100VA / 825W Peak Load Capacity',
        'Waveform': 'Pure Sine Wave (Grid Quality Output)',
        'Display': 'Intuitive LCD Display with Backup Hours Remaining',
        'Protection': 'Short-Circuit, Deep Discharge, Reverse Polarity',
      }),
      price: 13500.0,
      discountPrice: 12200.0,
      stock: 8,
      condition: 'NEW',
      warrantyPeriodMonths: 24,
      images: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      isActive: true,
    },
  });

  // 8. Create Customer Registered Device & Warranty
  const registeredDevice = await prisma.deviceRegistration.upsert({
    where: { serialNumber: 'HPE840G8-BD-99214' },
    update: {},
    create: {
      customerId: customerProfile.id,
      productId: prodLaptop.id,
      productName: 'HP EliteBook 840 G8',
      brand: 'HP',
      model: 'EliteBook 840 G8 16GB/512GB',
      serialNumber: 'HPE840G8-BD-99214',
      invoiceNumber: 'INV-NE-2025-0089',
      purchaseDate: new Date('2025-03-15'),
      warrantyPeriodMonths: 12,
      warrantyExpiryDate: new Date('2026-03-15'),
      status: 'ACTIVE',
    },
  });

  // 9. Create Active Bookings for Demo & Testing
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

  await prisma.bookingTimeline.create({
    data: {
      bookingId: booking2.id,
      status: 'MATCHING',
      actorRole: 'SYSTEM',
      note: 'Job broadcasted to verified technicians in Moulvibazar.',
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
      value: 'Shop #5, MR Plaza, Kusumbag, Moulvibazar',
      description: 'Headquarters physical address.',
    },
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
