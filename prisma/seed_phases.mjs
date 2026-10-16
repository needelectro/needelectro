import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 10 (Training), Phase 11 (Branches), Phase 12 (Sellers)...');

  // 1. Training Courses (Phase 10)
  const courseElectrician = await prisma.trainingCourse.upsert({
    where: { slug: 'residential-commercial-electrical-systems' },
    update: {},
    create: {
      title: 'Residential & Commercial Electrical Systems Engineering',
      slug: 'residential-commercial-electrical-systems',
      category: 'ELECTRICAL',
      shortDescription: 'Master safety-first conduit concealment, distribution board wiring, 3-phase balancing, and earthing diagnostics.',
      fullDescription: 'Comprehensive hands-on curriculum developed by NEED ELECTRO master engineers. Covers BNBC electrical codes, modern circuit breaker sizing, concealed conduit routing, safety earthing resistance measurement, sub-station basics, and smart home automation integration.',
      durationWeeks: 8,
      totalHours: 64,
      fee: 6500.0,
      certificationIncluded: true,
      syllabus: JSON.stringify([
        { module: 1, title: 'Electrical Fundamentals & BNBC Safety Protocols' },
        { module: 2, title: 'Single-Phase & 3-Phase Concealed Conduit Wiring' },
        { module: 3, title: 'Main Distribution Board (MDB/SDB) & MCB/RCCB Design' },
        { module: 4, title: 'Earthing Systems & Earth Resistance Testing (Megger)' },
        { module: 5, title: 'Industrial Motor Starters & Load Balancing' },
        { module: 6, title: 'Field Apprenticeship & Customer Service Protocols' },
      ]),
      prerequisites: 'Minimum SSC pass or equivalent basic technical interest.',
      careerOutcomes: 'Direct onboarding into NEED ELECTRO Verified Technician Network upon evaluation, or eligibility for electrical contractor licensing.',
      instructorName: 'Engr. Md. Faruk Ahmed, Lead Electrical Engineer',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    },
  });

  const courseCCTV = await prisma.trainingCourse.upsert({
    where: { slug: 'enterprise-cctv-surveillance-networking' },
    update: {},
    create: {
      title: 'Enterprise CCTV Surveillance & Network Engineering',
      slug: 'enterprise-cctv-surveillance-networking',
      category: 'CCTV',
      shortDescription: 'Professional training in IP cameras, Dahua/Hikvision NVR/XVR setup, PoE switches, fiber optical links, and remote mobile access.',
      fullDescription: 'Become an industry-ready security engineer. Learn coaxial and Ethernet cabling, IP camera subnet addressing, PTZ calibration, AI intrusion tripwires, DMSS / Hik-Connect cloud integration, and enterprise multi-channel recording setups.',
      durationWeeks: 6,
      totalHours: 48,
      fee: 5500.0,
      certificationIncluded: true,
      syllabus: JSON.stringify([
        { module: 1, title: 'Optics, Sensor Types & Surveillance Architecture' },
        { module: 2, title: 'HD Analog vs IP Cameras & PoE Networking' },
        { module: 3, title: 'XVR/NVR Configuration, Storage Sizing & RAID' },
        { module: 4, title: 'Network Routing, Static IP & Mobile Cloud Portals' },
        { module: 5, title: 'Troubleshooting Interference, Voltage Drops & Lab Exam' },
      ]),
      prerequisites: 'Basic computer literacy.',
      careerOutcomes: 'Deployment as certified CCTV installation technician across commercial and residential sites in Sylhet division.',
      instructorName: 'Engr. Tanvir Hossain, Security Systems Lead',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
    },
  });

  const courseHardware = await prisma.trainingCourse.upsert({
    where: { slug: 'laptop-chip-level-hardware-diagnostics' },
    update: {},
    create: {
      title: 'Laptop Chip-Level Hardware Diagnostics & Micro-Soldering',
      slug: 'laptop-chip-level-hardware-diagnostics',
      category: 'COMPUTER',
      shortDescription: 'Schematics tracing, motherboard short-circuit troubleshooting, SMD micro-soldering, and BIOS reprogramming.',
      fullDescription: 'Advanced lab training at NEED ELECTRO technical center. Learn board-level power sequence analysis (3V/5V rails, CPU VCORE), DC bench power supply diagnostics, thermal camera thermal fault detection, SMD soldering stations, and oscilloscope signal analysis.',
      durationWeeks: 10,
      totalHours: 80,
      fee: 9500.0,
      certificationIncluded: true,
      syllabus: JSON.stringify([
        { module: 1, title: 'Laptop Motherboard Architecture & Power Sequences' },
        { module: 2, title: 'Schematic Diagrams & Boardview Reading' },
        { module: 3, title: 'Short Circuit Finding with DC Bench Supply' },
        { module: 4, title: 'SMD Micro-Soldering (MOSFETs, PWM ICs, EC IO Chips)' },
        { module: 5, title: 'BIOS / EC Firmware Extraction & EEPROM Programming' },
      ]),
      prerequisites: 'Basic understanding of electronics and multimeter usage.',
      careerOutcomes: 'Hardware specialist capable of repairing premium enterprise laptops and logic boards.',
      instructorName: 'Engr. Rafiqul Islam, Chief Lab Specialist',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    },
  });

  const courseIPS = await prisma.trainingCourse.upsert({
    where: { slug: 'pure-sine-wave-ips-solar-inverter-systems' },
    update: {},
    create: {
      title: 'Pure Sine Wave IPS & Solar Inverter Systems Integration',
      slug: 'pure-sine-wave-ips-solar-inverter-systems',
      category: 'SOLAR',
      shortDescription: 'Sizing inverters, tubular battery bank maintenance, MPPT solar chargers, and zero-flicker automatic transfer switching.',
      fullDescription: 'Comprehensive training for home and commercial uninterrupted power supply. Understand transformer vs DSP high-frequency topologies, battery chemical health testing, solar panel string sizing, and safety isolation switches.',
      durationWeeks: 6,
      totalHours: 48,
      fee: 5000.0,
      certificationIncluded: true,
      syllabus: JSON.stringify([
        { module: 1, title: 'Inverter Topologies & Pure Sine Wave Generation' },
        { module: 2, title: 'Lead-Acid, Tubular & Lithium Battery Technology' },
        { module: 3, title: 'Solar PV Array Calculations & MPPT Controllers' },
        { module: 4, title: 'Installation Safety, Neutral Grounding & Surge Arresters' },
      ]),
      prerequisites: 'Basic electrical familiarity.',
      careerOutcomes: 'IPS and solar emergency power engineer.',
      instructorName: 'Engr. Md. Faruk Ahmed',
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    },
  });

  // Sample Certified Graduate for Certificate Verification Lookup
  await prisma.trainingApplication.upsert({
    where: { certificateNumber: 'NE-CERT-2026-0104' },
    update: {},
    create: {
      courseId: courseElectrician.id,
      fullName: 'Md. Kamrul Hasan',
      email: 'kamrul.grad@needelectro.com',
      phone: '01711223344',
      nidNumber: '1998581729000012',
      education: 'Diploma in Electrical Engineering',
      address: 'Kusumbag, Moulvibazar',
      experienceLevel: 'INTERMEDIATE',
      motivation: 'Seeking certified status to practice commercial installations with NEED ELECTRO.',
      status: 'CERTIFIED',
      certificateNumber: 'NE-CERT-2026-0104',
      certificateIssueDate: new Date('2026-03-01'),
      notes: 'Passed theoretical and practical board-level exams with Grade A+ (94%). Verified Technician ID: NE-TECH-0089.',
    },
  });

  // 2. Physical Branches Network (Phase 11)
  await prisma.branch.upsert({
    where: { slug: 'moulvibazar-headquarters' },
    update: {},
    create: {
      name: 'NEED ELECTRO Headquarters & Main Technical Center',
      slug: 'moulvibazar-headquarters',
      division: 'Sylhet',
      district: 'Moulvibazar',
      upazila: 'Moulvibazar Sadar',
      address: 'Kusumbag Point, Moulvibazar Sadar, Moulvibazar 3200',
      phone: '+880 1733-983752',
      email: 'needelectrobd@gmail.com',
      managerName: 'Kazi Mahbubur Rahman, General Manager',
      isHeadquarters: true,
      coverageAreas: 'Moulvibazar Sadar, Kusumbag, Court Road, Berir Char, Shamshernagar Road, Shah Mostafa Road',
      workingHours: 'Saturday - Thursday: 9:00 AM - 8:30 PM (Friday On-Call Emergency)',
      emergencyHotline: '01733 983752',
    },
  });

  await prisma.branch.upsert({
    where: { slug: 'sreemangal-regional-hub' },
    update: {},
    create: {
      name: 'NEED ELECTRO Sreemangal Regional Lab & Service Hub',
      slug: 'sreemangal-regional-hub',
      division: 'Sylhet',
      district: 'Moulvibazar',
      upazila: 'Sreemangal',
      address: 'Holding #12, College Road (Near Chowmouhoni), Sreemangal 3210',
      phone: '+880 1733-983753',
      email: 'sreemangal@needelectro.com',
      managerName: 'Syed Al-Amin, Operations In-Charge',
      isHeadquarters: false,
      coverageAreas: 'Sreemangal Municipality, Bhanugach Road, Kalighat, Radhanagar Resort Zone, Kamalganj Border',
      workingHours: 'Saturday - Thursday: 9:30 AM - 8:00 PM',
      emergencyHotline: '01733 983753',
    },
  });

  await prisma.branch.upsert({
    where: { slug: 'sylhet-divisional-liaison' },
    update: {},
    create: {
      name: 'NEED ELECTRO Sylhet Divisional Center & Institutional Hub',
      slug: 'sylhet-divisional-liaison',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Sylhet Sadar',
      address: 'Level 4, Millenium Complex, Zindabazar, Sylhet 3100',
      phone: '+880 1733-983754',
      email: 'sylhet@needelectro.com',
      managerName: 'Engr. Nazmul Haque, Regional Director',
      isHeadquarters: false,
      coverageAreas: 'Sylhet City Corporation, Zindabazar, Ambarkhana, Subidbazar, Shahjalal Uposhohor, South Surma',
      workingHours: 'Saturday - Thursday: 9:00 AM - 7:30 PM',
      emergencyHotline: '01733 983754',
    },
  });

  // 3. Marketplace Verified Seller Partner (Phase 12)
  await prisma.sellerProfile.upsert({
    where: { slug: 'surma-technology-hardware-imports' },
    update: {},
    create: {
      businessName: 'Surma Technology & Hardware Imports Ltd.',
      slug: 'surma-technology-hardware-imports',
      tradeLicenseNumber: 'TRAD/MZB/2024/09842',
      contactPerson: 'Md. Tariqul Islam',
      phone: '01712984567',
      email: 'tariqul@surmatechbd.com',
      address: 'Kusumbag Point, Moulvibazar Sadar, Moulvibazar 3200',
      productCategories: 'Laptops, CCTV Hardware, Network Switches',
      commissionRate: 7.5,
      status: 'VERIFIED',
      adminNotes: 'Verified authorized enterprise distributor. Passed quality audit on genuine warranties.',
    },
  });

  console.log('Seeded Phases 10, 11, and 12 successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
